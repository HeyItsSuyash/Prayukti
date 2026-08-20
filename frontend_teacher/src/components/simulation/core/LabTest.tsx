"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  BookOpen, Clock, Trophy, CheckSquare, Shield, AlertTriangle, 
  XCircle, CheckCircle2, ChevronLeft, ChevronRight, Flag, LogOut,
  Layers
} from "lucide-react";
import { getQuestionsForLab, shuffleQuestions, TestQuestion } from "@/data/lab-test-questions";

interface LabTestProps {
  labId: string;
  labTitle: string;
}

type TestState = "instructions" | "active" | "result" | "kicked";

const getSubjectName = (id: string) => {
  const lower = id.toLowerCase();
  if (lower.startsWith('cn')) return "Computer Networks";
  if (lower.startsWith('dsa') || lower.startsWith('data')) return "Data Structures & Algorithms";
  if (lower.startsWith('dbms')) return "Database Management Systems";
  if (lower.startsWith('oops') || lower.startsWith('java')) return "Object Oriented Programming";
  if (lower.startsWith('dld') || lower.startsWith('digital')) return "Digital Logic Design";
  if (lower.startsWith('os')) return "Operating Systems";
  if (lower.startsWith('mpmc') || lower.startsWith('micro')) return "Microprocessors & Microcontrollers";
  if (lower.startsWith('daa')) return "Design & Analysis of Algorithms";
  if (lower.startsWith('pds')) return "Programming & Data Structures";
  if (lower.startsWith('cd')) return "Compiler Design";
  if (lower.startsWith('ot')) return "Optimization Techniques";
  if (lower.startsWith('bee')) return "Basic Electrical Engineering";
  if (lower.startsWith('coa')) return "Computer Organization & Architecture";
  if (lower.startsWith('error-detection')) return "Error Detection";
  return "Virtual Lab Assessment";
};

export default function LabTest({ labId, labTitle }: LabTestProps) {
  const [testState, setTestState] = useState<TestState>("instructions");
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<boolean[]>([]);
  const [flaggedAnswers, setFlaggedAnswers] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [timeTaken, setTimeTaken] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [userEmail, setUserEmail] = useState("suyash@university.ac.in");
  const [userName, setUserName] = useState("Suyash");
  const [userInitial, setUserInitial] = useState("S");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load user info
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("vlab_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email) {
          setUserEmail(user.email);
          const name = user.email.split("@")[0];
          setUserName(name);
          setUserInitial(name.charAt(0).toUpperCase());
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load & shuffle questions
  useEffect(() => {
    const raw = getQuestionsForLab(labId);
    const shuffled = shuffleQuestions(raw).slice(0, 30);
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setSavedAnswers(new Array(shuffled.length).fill(false));
    setFlaggedAnswers(new Array(shuffled.length).fill(false));
  }, [labId]);

  // ─── FULLSCREEN ───────────────────────────────────────────────────────────
  const enterFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
      else if ((el as any).mozRequestFullScreen) (el as any).mozRequestFullScreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
    }
  }, []);

  // ─── ANTI-CHEAT: TAB SWITCH ───────────────────────────────────────────────
  useEffect(() => {
    if (testState !== "active") return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarnings((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            exitFullscreen();
            setTestState("kicked");
            clearInterval(timerRef.current!);
          } else {
            setWarningMessage(
              ` Tab Switch Warning ${next}/3: You switched tabs or minimized the window. ${
                3 - next
              } warning(s) remaining before you are removed from this test.`
            );
            setShowWarningModal(true);
          }
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [testState, exitFullscreen]);

  // ─── ANTI-CHEAT: BEFORE UNLOAD ──────────────────────────────────────────
  useEffect(() => {
    if (testState !== "active") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your test progress will be lost.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [testState]);

  // ─── ANTI-CHEAT: COPY / PASTE / CONTEXT MENU ─────────────────────────────
  useEffect(() => {
    if (testState !== "active") return;
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("contextmenu", prevent);
    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("contextmenu", prevent);
    };
  }, [testState]);

  // ─── TIMER ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (testState !== "active") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [testState]);

  // ─── START TEST ───────────────────────────────────────────────────────────
  const startTest = () => {
    enterFullscreen();
    setTestState("active");
    setCurrentIndex(0);
    setTimeLeft(30 * 60);
    setTimeTaken(0);
    setTabWarnings(0);
    const raw = getQuestionsForLab(labId);
    const shuffled = shuffleQuestions(raw).slice(0, 30);
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setSavedAnswers(new Array(shuffled.length).fill(false));
    setFlaggedAnswers(new Array(shuffled.length).fill(false));
  };

  // ─── TEST ACTIONS ─────────────────────────────────────────────────────────
  const selectOption = (optionIdx: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = optionIdx;
      return updated;
    });
    setSavedAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = false;
      return updated;
    });
  };

  const clearAnswer = () => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = null;
      return updated;
    });
    setSavedAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = false;
      return updated;
    });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const saveAndNext = () => {
    if (answers[currentIndex] !== null) {
      setSavedAnswers((prev) => {
        const updated = [...prev];
        updated[currentIndex] = true;
        return updated;
      });
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowSubmitConfirm(true);
    }
  };

  const toggleFlag = () => {
    setFlaggedAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = !updated[currentIndex];
      return updated;
    });
  };

  const submitTest = () => {
    clearInterval(timerRef.current!);
    exitFullscreen();
    setShowSubmitConfirm(false);
    setTestState("result");
  };

  const handleAutoSubmit = () => {
    exitFullscreen();
    setTestState("result");
  };

  const quitTest = () => {
    clearInterval(timerRef.current!);
    exitFullscreen();
    setShowQuitConfirm(false);
    setTestState("instructions");
    setCurrentIndex(0);
    setTimeLeft(30 * 60);
    setTimeTaken(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ─── RESULTS COMPUTATION ─────────────────────────────────────────────────
  const correctCount = answers.filter((a, i) => a !== null && questions[i] && a === questions[i].correctAnswer).length;
  const attemptedCount = answers.filter((a) => a !== null).length;
  const wrongCount = attemptedCount - correctCount;
  const skippedCount = questions.length - attemptedCount;
  const score = Math.round((correctCount / questions.length) * 100) || 0;
  const passMarks = 12; // 40% of 30
  const isPassed = correctCount >= passMarks;

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────
  const getQuestionStatus = (i: number) => {
    if (i === currentIndex) return "current";
    if (flaggedAnswers[i]) return "flagged";
    if (savedAnswers[i]) return "answered";
    if (answers[i] !== null) return "answered";
    return "unattempted";
  };

  // ─── MAIN RENDER ──────────────────────────────────────────────────────────
  const renderContent = () => {
    if (questions.length === 0 && testState !== "instructions") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center bg-background">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-muted-foreground">Test Not Available</h2>
          <p className="text-muted-foreground mt-2">No test questions found for this lab experiment yet.</p>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // KICKED OUT SCREEN
    // ═══════════════════════════════════════════════════════════════════════════
    if (testState === "kicked") {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-background text-foreground p-10 text-center select-none">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-14 h-14 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-3">Removed from Test</h1>
          <p className="text-muted-foreground max-w-lg text-lg mb-8">
            You were removed from the test after switching tabs/windows 3 times. This action has been logged.
          </p>
          <button
            onClick={() => { setTestState("instructions"); setTabWarnings(0); }}
            className="px-8 py-3 bg-red-600 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-red-700  shadow-none-none"
          >
            Return to Instructions
          </button>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INSTRUCTIONS SCREEN
    // ═══════════════════════════════════════════════════════════════════════════
    if (testState === "instructions") {
      return (
        <div className="flex flex-col items-center min-h-full bg-background text-muted-foreground select-none overflow-y-auto pb-12">
          {/* Header Banner */}
          <div className="w-full max-w-4xl mt-8">
            <div className="bg-gradient-to-br from-[#021D24] to-[#059669] rounded-t-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] opacity-10">
                <BookOpen className="w-64 h-64" />
              </div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="bg-card/20 p-3 rounded-xl backdrop-blur-sm">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white/80 font-bold tracking-widest text-xs uppercase mb-1">{getSubjectName(labId)}</p>
                  <h1 className="text-4xl font-bold text-white mb-3">{labTitle}</h1>
                  <p className="text-white/80 text-sm">Chapter Test • Online Assessment</p>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-card rounded-b-2xl shadow-none-none border border-border grid grid-cols-4 divide-x divide-slate-100 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="font-bold text-xl">30</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Questions</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="font-bold text-xl">30 min</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Duration</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                </div>
                <span className="font-bold text-xl">30</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Total Marks</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center mb-2">
                  <CheckSquare className="w-5 h-5 text-green-500" />
                </div>
                <span className="font-bold text-xl">12</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Passing Marks</span>
              </div>
            </div>

            {/* User Card */}
            <div className="bg-card rounded-xl shadow-none-none border border-border p-5 mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {userInitial}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-muted-foreground">{userName} <span className="text-muted-foreground font-sans text-sm font-normal">(student)</span></h3>
                  <p className="text-muted-foreground text-sm">{userEmail}</p>
                </div>
              </div>
              <div className="bg-primary/20 text-primary font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest">
                Student
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Instructions</h2>
              <div className="space-y-4">
                {[
                  "This test contains 30 multiple choice questions.",
                  "Each question carries 1 mark. No negative marking.",
                  "Time limit: 30 minutes. Auto-submits on timeout.",
                  "Tab switching is strictly prohibited (max 3 warnings).",
                  "Copying text or using right-click is disabled.",
                  "You can flag questions to review later.",
                  "Use the Question Palette to navigate between questions.",
                  "Review your answers before final submission."
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startTest}
              disabled={questions.length === 0}
              className="w-full mt-10 py-4 bg-primary hover:bg-primary text-white font-bold rounded-xl text-lg  shadow-none-none active:scale-[0.98] disabled:opacity-50"
            >
              {questions.length === 0 ? "Loading Questions..." : "START TEST"}
            </button>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RESULT SCREEN
    // ═══════════════════════════════════════════════════════════════════════════
    if (testState === "result") {
      return (
        <div className="overflow-y-auto h-full bg-background text-muted-foreground p-8 select-none">
          <div className="max-w-4xl mx-auto">
            {/* Header Banner */}
            <div className={`rounded-xl p-8 text-center text-white mb-8 relative overflow-hidden shadow-none-none ${isPassed ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}>
              <div className="relative z-10">
                <Layers className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h1 className="text-3xl font-bold mb-2">
                  {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
                </h1>
                <p className="text-white/90 text-sm">
                  {isPassed ? 'You have successfully passed the assessment.' : 'You did not meet the passing criteria. Try again!'}
                </p>
              </div>
            </div>

            {/* Header Result Banner */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center text-xl font-bold">
                  {userInitial}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    {userName}
                    <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-md">Student</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Lab Assessment</span>
                <p className="font-bold text-foreground text-sm truncate max-w-[250px]">{labTitle}</p>
              </div>
            </div>

            {/* Main Score Card */}
            <div className="bg-card rounded-2xl border border-border p-8 mb-6 shadow-sm relative overflow-hidden">
              {/* Circle Score */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="w-36 h-36 rounded-full border-[10px] border-muted flex flex-col items-center justify-center relative shadow-inner">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke={isPassed ? '#10b981' : '#f43f5e'}
                      strokeWidth="10"
                      strokeDasharray={`${score * 2.76} 276`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-3xl font-black text-foreground">{score}%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Overall Score</span>
                </div>

                <div className="mt-4">
                  {isPassed ? (
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Assessment Passed
                    </span>
                  ) : (
                    <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" /> Assessment Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Breakdown Bar */}
              <div className="space-y-2">
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  <div style={{ width: `${(correctCount / 30) * 100}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${(wrongCount / 30) * 100}%` }} className="bg-rose-500 h-full" />
                  <div style={{ width: `${(skippedCount / 30) * 100}%` }} className="bg-amber-500 h-full" />
                </div>
                <div className="grid grid-cols-4 text-xs font-bold text-muted-foreground pt-1">
                  <div className="text-left text-emerald-600 dark:text-emerald-400">● {correctCount} Correct</div>
                  <div className="text-center text-rose-600 dark:text-rose-400">● {wrongCount} Wrong</div>
                  <div className="text-center text-amber-600 dark:text-amber-400">● {skippedCount} Skipped</div>
                  <div className="text-right text-foreground">30 Total</div>
                </div>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                <span className="text-2xl font-black text-foreground">{correctCount}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Correct</span>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <XCircle className="w-5 h-5 text-rose-500 mb-1" />
                <span className="text-2xl font-black text-foreground">{wrongCount}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Wrong</span>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-2xl font-black text-foreground">{skippedCount}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Skipped</span>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <Clock className="w-5 h-5 text-primary mb-1" />
                <span className="text-xl font-black text-foreground">{formatTime(timeTaken)}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time Taken</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setTestState("active")}
                className="flex-1 py-3.5 bg-card hover:bg-muted text-foreground border border-border font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-colors shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-primary" /> Review Answers
              </button>
              <button
                onClick={startTest}
                className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4 rotate-180" /> Retake Test
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTIVE TEST SCREEN
    // ═══════════════════════════════════════════════════════════════════════════
    const currentQuestion = questions[currentIndex];
    const currentAnswer = answers[currentIndex];
    const isFlagged = flaggedAnswers[currentIndex];
    
    return (
      <div className="flex flex-col h-full bg-background text-muted-foreground select-none">
        {/* TOP HEADER */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 flex-shrink-0 shadow-none-none z-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowQuitConfirm(true)}
              className="text-red-500 border border-red-200 hover:bg-red-50 text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-widest "
            >
              Quit Test
            </button>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm font-bold w-14">Q {currentIndex + 1} / 30</span>
              <div className="w-48 h-1.5 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${((currentIndex + 1) / 30) * 100}%` }} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full font-bold text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-3 border-l border-border pl-6">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                {userInitial}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-muted-foreground">{userName} <span className="text-muted-foreground font-normal">(student)</span></p>
                <p className="text-[10px] text-muted-foreground truncate w-32">{userEmail}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* MAIN LEFT AREA */}
          <main className="flex-1 overflow-y-auto p-8 flex flex-col relative">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
              
              {/* Question Card */}
              <div className="bg-card rounded-xl shadow-none-none border border-border p-8 mb-6 relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-none-none">
                      {currentIndex + 1}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question <span className="text-muted-foreground font-normal ml-1">+1 Mark</span></span>
                  </div>
                  <button
                    onClick={toggleFlag}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-bold tracking-widest uppercase  ${
                      isFlagged ? 'bg-yellow-500 border-yellow-600 text-black' : 'bg-card border-border text-muted-foreground hover:bg-card'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-black' : ''}`} /> Flag
                  </button>
                </div>
                <h2 className="text-xl font-bold text-muted-foreground leading-relaxed">
                  {currentQuestion?.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion?.options.map((option, optIdx) => {
                  const isSelected = currentAnswer === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectOption(optIdx)}
                      className={`w-full text-left px-6 py-5 rounded-xl border text-[15px]  flex items-center gap-4 ${
                        isSelected
                          ? "border-primary bg-card ring-1 ring-primary/50 shadow-none-none"
                          : "bg-card border-border hover:border-primary hover:bg-card shadow-none-none"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        isSelected ? "border-primary text-white bg-primary" : "border-border text-muted-foreground bg-card"
                      }`}>
                        {["A", "B", "C", "D"][optIdx]}
                      </span>
                      <span className={`${isSelected ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{option}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Bottom Footer Navigation */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-between px-8 shadow-none-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 text-orange-500 border border-orange-200 hover:bg-orange-500/10 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest  disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span className="text-green-600">{answers.filter(a => a !== null).length}</span> / 30 answered
              </span>

              <div className="flex gap-3">
                <button
                  onClick={clearAnswer}
                  className="flex items-center gap-2 text-muted-foreground border border-border hover:bg-card px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest "
                >
                  Clear & Next <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={saveAndNext}
                  className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest  shadow-none-none "
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR - QUESTION PALETTE */}
          <aside className="w-80 bg-card border-l border-border flex flex-col flex-shrink-0 shadow-none-[-4px_0_15px_-3px_rgba(0,0,0,0.03)] z-10">
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Question Palette</p>
              
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, i) => {
                  const status = getQuestionStatus(i);
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-10 text-xs font-bold rounded-xl  border flex items-center justify-center relative ${
                        status === "current"
                          ? "bg-primary text-white border-primary shadow-none-none transform scale-105"
                          : status === "flagged"
                          ? "bg-yellow-500 text-black border-yellow-600"
                          : status === "answered"
                          ? "bg-green-500 text-white border-green-500 shadow-none-none"
                          : "bg-card text-muted-foreground border-border hover:bg-card hover:border-border"
                      }`}
                    >
                      {i + 1}
                      {status === "flagged" && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 border border-white rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-8 space-y-3">
                {[
                  { color: "bg-green-500", label: "Answered" },
                  { color: "bg-card border border-border", label: "Not Answered" },
                  { color: "bg-yellow-500 border border-yellow-600", label: "Flagged" },
                  { color: "bg-primary", label: "Current" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-none-[4px] ${item.color}`} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Submit Button */}
            <div className="p-6 border-t border-border bg-card/50">
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="w-full py-4 bg-primary hover:bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-none-none  "
              >
                <CheckCircle2 className="w-5 h-5" /> SUBMIT TEST
              </button>
              <p className="text-center mt-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                {answers.filter(a => a !== null).length}/30 Answered
              </p>
            </div>
          </aside>
        </div>

        {/* MODALS */}
        {showWarningModal && (
          <div className="fixed inset-0 bg-card/40 backdrop-blur-sm z-[999] flex items-center justify-center p-6">
              <div className="bg-card rounded-xl p-8 max-w-md w-full text-center shadow-none-2xl border border-red-100">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-black uppercase text-muted-foreground mb-3">Integrity Warning</h2>
              <p className="text-muted-foreground text-sm mb-6">{warningMessage}</p>
              <button
                onClick={() => setShowWarningModal(false)}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest rounded-xl  shadow-none-none"
                >
                  I Understand — Return
              </button>
            </div>
          </div>
        )}

        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-card/40 backdrop-blur-sm z-[999] flex items-center justify-center p-6">
            <div className="bg-card rounded-xl p-8 max-w-md w-full text-center shadow-none-2xl">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-black uppercase text-muted-foreground mb-2">Submit Test?</h2>
              <p className="text-muted-foreground text-sm mb-2">
                You have answered {answers.filter((a) => a !== null).length} of {questions.length} questions.
              </p>
                <p className="text-red-500 text-sm font-bold mb-6 mt-4">! This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-3 border border-border text-muted-foreground hover:bg-card font-bold uppercase tracking-widest rounded-xl  text-xs"
                >
                  Review Again
                </button>
                <button
                  onClick={submitTest}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold uppercase tracking-widest rounded-xl  text-xs shadow-none-none"
                >
                  Final Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {showQuitConfirm && (
          <div className="fixed inset-0 bg-card/40 backdrop-blur-sm z-[999] flex items-center justify-center p-6">
            <div className="bg-card rounded-xl p-8 max-w-md w-full text-center shadow-none-2xl">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-black uppercase mb-2 text-muted-foreground">Quit Test?</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Your progress will be lost. Are you sure you want to quit this test?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="flex-1 py-3 border border-border text-muted-foreground hover:bg-card font-bold uppercase tracking-widest rounded-xl  text-xs"
                >
                  Continue Test
                </button>
                <button
                  onClick={quitTest}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest rounded-xl  text-xs shadow-none-none"
                >
                  Yes, Quit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }; // end renderContent

  return (
    <div ref={containerRef} className="h-full w-full">
      {renderContent()}
    </div>
  );
}

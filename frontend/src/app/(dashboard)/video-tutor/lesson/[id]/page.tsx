"use client";

import React, { useState, useEffect, useRef, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import VideoTutorLayout from "@/components/video-tutor/VideoTutorLayout";
import AvatarCharacter from "@/components/video-tutor/AvatarCharacter";
import AnimationCanvas from "@/components/video-tutor/AnimationCanvas";
import MermaidViewer from "@/components/video-tutor/MermaidViewer";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ReactMarkdown from "react-markdown";

export default function LessonPlayerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const lessonId = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [payload, setPayload] = useState<any>(null);
    
    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressTime, setProgressTime] = useState(0);
    const [duration, setDuration] = useState(300);
    const [isSaved, setIsSaved] = useState(false);
    
    // Interrupt states
    const [doubtQuery, setDoubtQuery] = useState("");
    const [interruptData, setInterruptData] = useState<any>(null);
    const [interruptLoading, setInterruptLoading] = useState(false);
    
    // Quiz states
    const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState<number | null>(null);

    // Audio narration speak states
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            synthRef.current = window.speechSynthesis;
        }
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    useEffect(() => {
        let heartbeatInterval: any;
        if (isAvatarSpeaking && synthRef.current) {
            heartbeatInterval = setInterval(() => {
                if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
                    synthRef.current.pause();
                    synthRef.current.resume();
                }
            }, 8000); // Trigger every 8 seconds to prevent speech synthesis freeze
        }
        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    }, [isAvatarSpeaking]);

    const fetchLessonPayload = async () => {
        setLoading(true);
        console.log("DEBUG lessonId before fetch:", lessonId);
        try {
            
            const res = await fetch(`${API_URL}/api/video-tutor/lessons/${lessonId}`, {
                /* removed auth header */
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Failed to load lesson (Status ${res.status}): ${errText}`);
            }
            const data = await res.json();
            setPayload(data);
            setDuration(data.lesson.durationSeconds || 300);
            setIsSaved(data.lesson.isSaved);
            if (data.progress) {
                // Seek to where they left off, rounded
                const startSec = Math.floor((data.progress.completionRate / 100) * data.lesson.durationSeconds);
                setProgressTime(startSec);
            }
        } catch (err) {
            console.error(err);
            // router.push("/video-tutor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lessonId) {
            fetchLessonPayload();
        }
    }, [lessonId]);

    // Timer loop for simulated playback
    useEffect(() => {
        let interval: any;
        if (isPlaying && !interruptData && progressTime < duration) {
            interval = setInterval(() => {
                setProgressTime(prev => {
                    const next = prev + 1;
                    if (next >= duration) {
                        setIsPlaying(false);
                        handleLogProgress(100.0, null, 1);
                        return duration;
                    }
                    // Log watch time heartbeat periodically
                    if (next % 10 === 0) {
                        const rate = (next / duration) * 100.0;
                        handleLogProgress(rate, null, 10);
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, interruptData, progressTime, duration]);

    // Speech synthesis helper
    const speakText = (text: string) => {
        if (!synthRef.current) return;
        synthRef.current.cancel();

        // Check language properties
        const langCode = payload?.lesson?.language === "Hindi" ? "hi-IN" : "en-US";

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 1.0;
        
        utterance.onstart = () => setIsAvatarSpeaking(true);
        utterance.onend = () => setIsAvatarSpeaking(false);
        utterance.onerror = () => setIsAvatarSpeaking(false);

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
    };

    // Auto speak when slide transitions
    const activeSectionIdx = Math.min(
        Math.floor((progressTime / duration) * (payload?.scripts?.length || 1)),
        (payload?.scripts?.length || 1) - 1
    );

    const activeScript = payload?.scripts?.[activeSectionIdx];
    const activeSlide = payload?.slides?.[activeSectionIdx];
    const activeDiagram = payload?.diagrams?.[0]; // Default main diagram
    const activeAnimation = payload?.animations?.[0]; // Default main animation

    // Trigger TTS on section transition if playing
    useEffect(() => {
        if (isPlaying && activeScript && !interruptData) {
            speakText(activeScript.narration_text);
        }
    }, [activeSectionIdx, isPlaying, !!interruptData]);

    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (synthRef.current) synthRef.current.pause();
            setIsAvatarSpeaking(false);
        } else {
            setIsPlaying(true);
            if (synthRef.current && synthRef.current.paused) {
                synthRef.current.resume();
                setIsAvatarSpeaking(true);
            } else if (activeScript) {
                speakText(activeScript.narration_text);
            }
        }
    };

    // Send watch progress parameters to backend
    const handleLogProgress = async (completionRate: number, quizScore: number | null, watchSec: number) => {
        try {
            
            await fetch(`${API_URL}/api/video-tutor/progress`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    lesson_id: lessonId,
                    completion_rate: completionRate,
                    quiz_score: quizScore,
                    watch_time_seconds: watchSec
                })
            });
        } catch (e) {
            console.error("Failed to log watch progress", e);
        }
    };

    // Bookmark save toggle
    const toggleBookmark = async () => {
        try {
            
            const method = isSaved ? "DELETE" : "POST";
            const res = await fetch(`${API_URL}/api/video-tutor/lessons/${lessonId}/save`, {
                method,
                /* removed auth header */
            });
            if (res.ok) {
                setIsSaved(!isSaved);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Handle user doubt interrupt
    const handleInterruptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doubtQuery.trim()) return;

        // Pause main playback
        setIsPlaying(false);
        if (synthRef.current) synthRef.current.cancel();
        setIsAvatarSpeaking(false);
        setInterruptLoading(true);

        try {
            
            const res = await fetch(`${API_URL}/api/video-tutor/interrupt`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    lesson_id: lessonId,
                    query: doubtQuery
                })
            });

            if (res.ok) {
                const data = await res.json();
                setInterruptData(data);
                // Narrate doubt answer
                speakText(data.response);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setInterruptLoading(false);
        }
    };

    // Close doubt override and resume main lesson
    const handleResume = () => {
        setInterruptData(null);
        setDoubtQuery("");
        if (synthRef.current) synthRef.current.cancel();
        setIsAvatarSpeaking(false);
        setIsPlaying(true);
        // Respeak original script
        if (activeScript) {
            speakText(activeScript.narration_text);
        }
    };

    // Handle quiz submission
    const handleQuizSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (payload?.quizzes?.length === 0) return;

        let correctCount = 0;
        payload.quizzes.forEach((q: any) => {
            if (quizAnswers[q.id] === q.correctOption) {
                correctCount++;
            }
        });

        const scorePercent = Math.round((correctCount / payload.quizzes.length) * 100);
        setQuizScore(scorePercent);
        setQuizSubmitted(true);

        // Save progress details
        const rate = (progressTime / duration) * 100.0;
        handleLogProgress(rate, scorePercent, 0);
    };

    // Reset quiz options
    const resetQuiz = () => {
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
    };

    // Format seconds to time string MM:SS
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    if (loading) {
        return (
            <VideoTutorLayout>
                <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                    <i className="bx bx-loader2 w-12 h-12 text-indigo-600 animate-spin mb-4"  />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Lesson Data...</p>
                </div>
            </VideoTutorLayout>
        );
    }

    if (!payload) {
        return (
            <VideoTutorLayout>
                <div className="text-center py-20 text-xs text-slate-400 italic">
                    Lesson payload failed to load.
                </div>
            </VideoTutorLayout>
        );
    }

    return (
        <VideoTutorLayout>
            <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl">
                {/* Lesson Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border-2 rounded-[2rem] p-6 shadow-sm">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl">
                            {payload.lesson.mode.replace("_", " ")} Mode
                        </span>
                        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-3 leading-none">
                            {payload.lesson.topic}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={toggleBookmark}
                            className={`rounded-2xl border-2 font-bold text-xs h-11 px-5 ${
                                isSaved ? "border-indigo-500 text-indigo-500 fill-current bg-indigo-500/10" : ""
                            }`}
                        >
                            <i className="bx bx-bookmark mr-2"  />
                            {isSaved ? "Saved" : "Save Lesson"}
                        </Button>
                    </div>
                </div>

                {/* Video Theatre Arena */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Player Screen */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="aspect-video w-full bg-slate-950 rounded-[2.5rem] border-2 border-slate-900 shadow-2xl relative overflow-hidden flex items-center justify-center p-4">
                            {/* Inner Visual: Avatar + Active slide / animation */}
                            <div className="w-full h-full grid grid-cols-3 gap-4 relative">
                                
                                {/* 1. Avatar column */}
                                <div className="col-span-1 flex flex-col justify-end">
                                    <AvatarCharacter 
                                        avatar={payload.lesson.avatar}
                                        animation={interruptData ? "explaining" : activeScript?.avatar_animation || "idle"}
                                        isSpeaking={isAvatarSpeaking}
                                    />
                                </div>

                                {/* 2. Active Slide/Diagram/Animation column */}
                                <div className="col-span-2 bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-800 p-6 flex flex-col justify-between overflow-y-auto text-slate-200">
                                    {interruptData ? (
                                        // Doubt Interruption Layout overrides normal slides
                                        <div className="space-y-4 text-xs animate-in zoom-in-95 duration-300">
                                            <div className="flex items-center gap-1.5 text-amber-500 font-extrabold uppercase text-[9px] tracking-wider">
                                                <i className="bx bx-alerttriangle"  /> Student Interrupt
                                            </div>
                                            <h4 className="font-extrabold text-slate-100">Doubt: &quot;{doubtQuery}&quot;</h4>
                                            <p className="leading-relaxed font-semibold text-slate-300">{interruptData.response}</p>
                                        </div>
                                    ) : (
                                        // Normal Lesson Slide
                                        <div className="space-y-4 text-xs animate-in fade-in duration-300">
                                            <h3 className="font-black text-sm uppercase tracking-tight text-white border-b border-slate-800 pb-2">
                                                {activeSlide?.title}
                                            </h3>
                                            <ul className="space-y-2.5 font-bold text-slate-400">
                                                {activeSlide?.bullet_points.map((point: string, idx: number) => (
                                                    <li key={idx} className="flex gap-2 items-start">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Small bottom label */}
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block pt-4">
                                        Prayukti Virtual Screen
                                    </span>
                                </div>
                            </div>

                            {/* Caption Overlay */}
                            <div className="absolute bottom-16 left-6 right-6 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm text-center text-xs font-semibold leading-relaxed text-slate-100 z-10 shadow-lg">
                                {interruptData ? interruptData.response : activeScript?.narration_text}
                            </div>

                            {/* Media Controls Bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800 px-6 py-3 flex items-center justify-between z-20">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={togglePlay}
                                    className="text-white hover:bg-slate-800 rounded-full w-9 h-9"
                                >
                                    {isPlaying ? <i className="bx bx-pause"  /> : <i className="bx bx-play"  />}
                                </Button>

                                {/* Playback Seek Bar */}
                                <div className="flex-1 mx-4 flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-slate-400 font-bold">{formatTime(progressTime)}</span>
                                    <input 
                                        type="range" 
                                        min={0} 
                                        max={duration} 
                                        value={progressTime}
                                        onChange={(e) => setProgressTime(Number(e.target.value))}
                                        className="flex-1 accent-indigo-500 h-1 rounded-full cursor-pointer bg-slate-800"
                                        disabled={!!interruptData}
                                    />
                                    <span className="text-[10px] font-mono text-slate-400 font-bold">{formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Slide/Animation sandbox area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Live Animation Simulation */}
                            <div className="h-64">
                                <AnimationCanvas 
                                    animationType={interruptData ? interruptData.animationType : activeAnimation?.animation_type}
                                    config={interruptData ? interruptData.configJson : activeAnimation?.config_json}
                                    currentTime={progressTime}
                                />
                            </div>

                            {/* Logic diagram schematic */}
                            <div className="h-64">
                                {activeDiagram && (
                                    <MermaidViewer chart={activeDiagram.mermaid_code} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interaction sidebar tabs (Interrupt doubt / Quiz) */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Doubt interruption form */}
                        <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <div className="flex items-center gap-2 border-b pb-3 mb-4 border-slate-100 dark:border-slate-800">
                                <i className="bx bx-help-circle text-indigo-600 dark:text-indigo-400"  />
                                <h3 className="font-black text-sm uppercase tracking-tight">Ask doubts in Real-time</h3>
                            </div>

                            {interruptData ? (
                                <div className="space-y-4 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-300">
                                    <p className="text-slate-500 leading-relaxed">
                                        The lesson is currently paused. Review the avatar explanation on the player screen.
                                    </p>
                                    <Button 
                                        onClick={handleResume}
                                        className="w-full h-11 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px]"
                                    >
                                        Resume original lesson
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleInterruptSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="d" className="font-bold text-xs uppercase text-slate-400">Interrupt Lesson Query</Label>
                                        <Input 
                                            id="d"
                                            placeholder="Ask: 'I don't understand XOR'"
                                            value={doubtQuery}
                                            onChange={(e) => setDoubtQuery(e.target.value)}
                                            className="rounded-xl border-2 h-11 text-xs"
                                            required
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={interruptLoading || !doubtQuery.trim()}
                                        className="w-full h-11 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-[9px] flex items-center gap-2"
                                    >
                                        {interruptLoading ? <i className="bx bx-loader2 w-4 h-4 animate-spin mx-auto"  /> : "Submit Interruption"}
                                    </Button>
                                </form>
                            )}
                        </Card>

                        {/* Practice assessment quiz */}
                        <Card className="rounded-[2rem] border-2 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <i className="bx bx-sparkles text-indigo-600 dark:text-indigo-400"  />
                                    <h3 className="font-black text-sm uppercase tracking-tight">Practice Quiz</h3>
                                </div>
                                {quizSubmitted && (
                                    <Button size="icon" variant="ghost" onClick={resetQuiz} className="w-8 h-8 rounded-full">
                                        <i className="bx bx-rotateccw"  />
                                    </Button>
                                )}
                            </div>

                            {payload.quizzes.length > 0 ? (
                                <form onSubmit={handleQuizSubmit} className="space-y-5 text-xs">
                                    {payload.quizzes.map((q: any, qIdx: number) => (
                                        <div key={q.id} className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">Q{qIdx + 1}: {q.question}</h4>
                                            <div className="flex flex-col gap-1.5 pt-1">
                                                {q.options.map((opt: string, optIdx: number) => {
                                                    const isSelected = quizAnswers[q.id] === optIdx;
                                                    const isCorrect = optIdx === q.correctOption;
                                                    let btnStyle = "border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";
                                                    
                                                    if (quizSubmitted) {
                                                        if (isCorrect) btnStyle = "border-green-500 bg-green-50/50 text-green-700 dark:bg-green-950/20 dark:text-green-300";
                                                        else if (isSelected) btnStyle = "border-red-500 bg-red-50/50 text-red-700 dark:bg-red-950/20 dark:text-red-300";
                                                    } else if (isSelected) {
                                                        btnStyle = "border-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:bg-indigo-950/20";
                                                    }

                                                    return (
                                                        <button 
                                                            key={optIdx}
                                                            type="button"
                                                            disabled={quizSubmitted}
                                                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                                            className={`p-2.5 rounded-lg text-left font-semibold transition-colors ${btnStyle}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {quizSubmitted && (
                                                <p className="text-[10px] text-slate-400 leading-relaxed pt-1.5 italic">
                                                    {q.explanation}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    {quizSubmitted ? (
                                        <div className="text-center p-3.5 rounded-xl border border-indigo-100 dark:border-slate-800 bg-indigo-50/10 dark:bg-indigo-950/10">
                                            <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 block mb-0.5">Quiz Results</span>
                                            <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                                                Score: {quizScore}%
                                            </p>
                                        </div>
                                    ) : (
                                        <Button 
                                            type="submit"
                                            disabled={Object.keys(quizAnswers).length < payload.quizzes.length}
                                            className="w-full h-11 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black uppercase tracking-widest text-[9px]"
                                        >
                                            Submit answers
                                        </Button>
                                    )}
                                </form>
                            ) : (
                                <p className="text-xs text-slate-400 italic text-center py-6">No quiz generated for this topic.</p>
                            )}
                        </Card>

                    </div>
                </div>

                {/* Downloadable markdown summaries */}
                <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 p-8 shadow-sm">
                    <div className="flex items-center gap-2 border-b pb-4 mb-6 border-slate-100 dark:border-slate-800">
                        <i className="bx bx-bookopen text-indigo-600 dark:text-indigo-400"  />
                        <h3 className="font-black text-base uppercase tracking-tight">AI Generated Study Notes</h3>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-semibold space-y-4">
                        <p>
                            The following notes are compiled dynamically matching the level requested by the student profile:
                        </p>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-3xl">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Topic Revision Summary</h4>
                            <ul className="list-disc pl-5 space-y-2.5">
                                {payload.slides.map((s: any, idx: number) => (
                                    <li key={idx}>
                                        <span className="font-extrabold text-slate-800 dark:text-slate-300">{s.title}:</span>
                                        <ul className="list-circle pl-5 mt-1 space-y-1 font-semibold text-slate-400">
                                            {s.bullet_points.map((pt: string, pIdx: number) => (
                                                <li key={pIdx}>{pt}</li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </VideoTutorLayout>
    );
}

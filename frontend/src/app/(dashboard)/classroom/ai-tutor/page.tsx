"use client";

import React, { useState, useEffect } from "react";
import ClassroomLayout from "@/components/classroom/ClassroomLayout";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import ReactMarkdown from "react-markdown";

interface Message {
    sender: "user" | "ai";
    text: string;
}

export default function AiTutorPage() {
    const [activeTab, setActiveTab] = useState<"chat" | "quiz" | "flashcards" | "notes">("chat");
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSub, setSelectedSub] = useState("");
    const [loading, setLoading] = useState(true);

    // Chat states
    const [chatMsg, setChatMsg] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { sender: "ai", text: "Hello! I am your Prayukti AI Tutor. Select your course module above and ask me any doubts about syllabus theory, concepts, or lab experiments!" }
    ]);
    const [chatLoading, setChatLoading] = useState(false);

    // Quiz states
    const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
    const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizLoading, setQuizLoading] = useState(false);

    // Flashcard states
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [currentCardIdx, setCurrentCardIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [flashLoading, setFlashLoading] = useState(false);

    // Notes states
    const [notesText, setNotesText] = useState("");
    const [notesLoading, setNotesLoading] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch(`${API_URL}/api/subjects`);
                if (res.ok) {
                    const data = await res.json();
                    setSubjects(data);
                    if (data.length > 0) {
                        setSelectedSub(data[0]._id);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    const handleSendDoubt = async () => {
        if (!chatMsg.trim() || !selectedSub) return;

        const userMsg = chatMsg;
        setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
        setChatMsg("");
        setChatLoading(true);

        // Track interaction event
        try {
            
            // Log event
            await fetch(`${API_URL}/api/participation/event`, {
                    credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: 'ai_tutor_interact',
                    details: { subject_id: selectedSub }
                })
            });

            // Ask tutor
            const res = await fetch(`${API_URL}/api/ai-tutor/ask`, {
                    credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject_id: selectedSub,
                    message: userMsg
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { sender: "ai", text: data.response }]);
            } else {
                throw new Error("Tutor solver failed");
            }
        } catch (err: any) {
            setMessages(prev => [...prev, { sender: "ai", text: `Error: ${err.message}. Please verify your connection.` }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleLoadQuiz = async () => {
        if (!selectedSub) return;
        setQuizLoading(true);
        setQuizAnswers({});
        setQuizSubmitted(false);

        try {
            
            const res = await fetch(`${API_URL}/api/ai-tutor/quiz`, {
                    credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject_id: selectedSub })
            });

            if (res.ok) {
                const data = await res.json();
                setQuizQuestions(data.questions);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setQuizLoading(false);
        }
    };

    const handleLoadFlashcards = async () => {
        if (!selectedSub) return;
        setFlashLoading(true);
        setCurrentCardIdx(0);
        setFlipped(false);

        try {
            
            const res = await fetch(`${API_URL}/api/ai-tutor/flashcard`, {
                    credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject_id: selectedSub })
            });

            if (res.ok) {
                const data = await res.json();
                setFlashcards(data.flashcards);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFlashLoading(false);
        }
    };

    const handleLoadNotes = async () => {
        if (!selectedSub) return;
        setNotesLoading(true);

        try {
            
            const res = await fetch(`${API_URL}/api/ai-tutor/notes`, {
                    credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject_id: selectedSub })
            });

            if (res.ok) {
                const data = await res.json();
                setNotesText(data.notes);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setNotesLoading(false);
        }
    };

    const handleCopyNotes = () => {
        navigator.clipboard.writeText(notesText);
        alert("Study notes copied to clipboard!");
    };

    // Load sub-modules if tab changes
    useEffect(() => {
        if (activeTab === "quiz" && quizQuestions.length === 0) handleLoadQuiz();
        if (activeTab === "flashcards" && flashcards.length === 0) handleLoadFlashcards();
        if (activeTab === "notes" && !notesText) handleLoadNotes();
    }, [activeTab, selectedSub]);

    return (
        <ClassroomLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            AI <span className="text-indigo-600 dark:text-indigo-400 italic">Tutor</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
                            Self-paced AI study companion. Explain topics, review flashcards, or take generated tests.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="font-bold text-xs uppercase text-slate-400 shrink-0">Topic context:</Label>
                        <Select onValueChange={(val) => {
                            setSelectedSub(val);
                            // Reset state for new subject context
                            setMessages([{ sender: "ai", text: "Context updated. How can I assist you with this new subject syllabus?" }]);
                            setQuizQuestions([]);
                            setFlashcards([]);
                            setNotesText("");
                        }} value={selectedSub}>
                            <SelectTrigger className="w-56 rounded-xl border-2">
                                <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {subjects.map((s) => (
                                    <SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Sub Tab Controls */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("chat")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "chat" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-messagesquare mr-2"  /> Ask Doubts
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("quiz")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "quiz" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-help-circle mr-2"  /> Take Quiz
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("flashcards")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "flashcards" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-bookopen mr-2"  /> Flashcards
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("notes")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "notes" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-sparkles mr-2"  /> Study Guides
                    </Button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <i className="bx bx-loader2 w-10 h-10 text-indigo-600 animate-spin mb-4"  />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Binding AI engine parameters...</p>
                    </div>
                ) : (
                    <div className="min-h-[500px]">
                        
                        {/* Tab 1: Ask Doubts */}
                        {activeTab === "chat" && (
                            <Card className="rounded-[2rem] border-2 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col h-[600px]">
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/20">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] p-4 rounded-2xl text-xs font-semibold leading-relaxed ${
                                                msg.sender === "user" 
                                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-br-none" 
                                                    : "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                                            }`}>
                                                {msg.sender === "ai" ? (
                                                    <div className="markdown-content prose dark:prose-invert max-w-none">
                                                        <ReactMarkdown>
                                                            {msg.text}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    msg.text
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border dark:bg-slate-900 dark:border-slate-800 border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                                <i className="bx bx-loader2 w-4 h-4 animate-spin text-slate-400"  />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tutor compiling answer...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                    <Input 
                                        placeholder="Ask a doubt... (e.g. explain time-complexity or show code templates)" 
                                        value={chatMsg}
                                        onChange={(e) => setChatMsg(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendDoubt()}
                                        className="rounded-xl border-2 h-12 text-xs focus-visible:ring-0"
                                        disabled={chatLoading}
                                    />
                                    <Button 
                                        size="icon" 
                                        onClick={handleSendDoubt}
                                        disabled={!chatMsg.trim() || chatLoading}
                                        className="w-12 h-12 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shrink-0 hover:bg-black"
                                    >
                                        <i className="bx bx-send"  />
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Tab 2: Quiz Engine */}
                        {activeTab === "quiz" && (
                            <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div>
                                        <h3 className="font-extrabold text-lg uppercase tracking-tight">AI Generated <span className="text-indigo-600 dark:text-indigo-400 italic">Assessment</span></h3>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">5 generated multiple-choice questions</p>
                                    </div>
                                    <Button size="sm" onClick={handleLoadQuiz} disabled={quizLoading} variant="outline" className="h-9 rounded-xl font-bold text-xs">
                                        <i className="bx bx-refreshcw mr-1.5"  /> Re-Generate Quiz
                                    </Button>
                                </div>

                                {quizLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                        <i className="bx bx-loader2 w-8 h-8 text-indigo-600 animate-spin mb-3"  />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Generating quiz dataset...</p>
                                    </div>
                                ) : quizQuestions.length > 0 ? (
                                    <div className="space-y-6">
                                        {quizQuestions.map((q, idx) => {
                                            const answered = quizAnswers[q.id] !== undefined;
                                            const selectedOpt = quizAnswers[q.id];
                                            return (
                                                <div key={q.id} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Question {idx + 1}</span>
                                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{q.question}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                        {q.options.map((opt: string, optIdx: number) => {
                                                            const isCorrect = optIdx === q.correctOption;
                                                            const isSelected = optIdx === selectedOpt;
                                                            let optStyle = "border-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";
                                                            if (quizSubmitted) {
                                                                if (isCorrect) {
                                                                    optStyle = "border-green-500 bg-green-50/50 dark:bg-green-950/20 text-green-950 dark:text-green-300";
                                                                } else if (isSelected) {
                                                                    optStyle = "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-950 dark:text-red-300";
                                                                }
                                                            } else if (isSelected) {
                                                                optStyle = "border-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:bg-indigo-950/20";
                                                            }
                                                            
                                                            return (
                                                                <button 
                                                                    key={optIdx}
                                                                    type="button"
                                                                    disabled={quizSubmitted}
                                                                    onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                                                    className={`p-3 rounded-xl text-xs font-bold text-left transition-all ${optStyle}`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {quizSubmitted && (
                                                        <div className="mt-3 p-3 bg-indigo-50/30 dark:bg-slate-900 border dark:border-slate-800 rounded-xl flex gap-2 items-start text-xs font-medium text-slate-600 dark:text-slate-400">
                                                            {quizAnswers[q.id] === q.correctOption 
                                                                ? <i className="bx bx-check-circle text-green-500 shrink-0"  />
                                                                : <i className="bx bx-xcircle text-red-500 shrink-0"  />
                                                            }
                                                            <div>
                                                                <span className="font-extrabold block text-slate-800 dark:text-slate-200 mb-0.5">
                                                                    {quizAnswers[q.id] === q.correctOption ? "Correct Option" : "Incorrect Option"}
                                                                </span>
                                                                {q.explanation}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {!quizSubmitted && (
                                            <Button 
                                                onClick={() => setQuizSubmitted(true)}
                                                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                                                className="w-full h-12 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-[10px]"
                                            >
                                                Submit quiz answers
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic text-center">Quiz datasets failed to synchronize.</p>
                                )}
                            </Card>
                        )}

                        {/* Tab 3: Flashcards */}
                        {activeTab === "flashcards" && (
                            <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 flex flex-col items-center">
                                <div className="w-full flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div>
                                        <h3 className="font-extrabold text-lg uppercase tracking-tight">AI Generated <span className="text-indigo-600 dark:text-indigo-400 italic">Flashcards</span></h3>
                                    </div>
                                    <Button size="sm" onClick={handleLoadFlashcards} disabled={flashLoading} variant="outline" className="h-9 rounded-xl font-bold text-xs">
                                        <i className="bx bx-refreshcw mr-1.5"  /> Re-Generate Cards
                                    </Button>
                                </div>

                                {flashLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                        <i className="bx bx-loader2 w-8 h-8 text-indigo-600 animate-spin mb-3"  />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Assembling flashcards...</p>
                                    </div>
                                ) : flashcards.length > 0 ? (
                                    <div className="w-full max-w-md flex flex-col items-center gap-6">
                                        
                                        {/* Flipping 3D Card wrapper */}
                                        <div 
                                            onClick={() => setFlipped(!flipped)}
                                            className="w-full h-64 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-8 cursor-pointer flex flex-col items-center justify-center text-center shadow-inner relative group select-none hover:border-indigo-400 transition-colors"
                                        >
                                            <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                {flipped ? "Answer" : "Question"} (Click to flip)
                                            </span>
                                            
                                            <h3 className={`text-base font-extrabold ${flipped ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-100"}`}>
                                                {flipped 
                                                    ? flashcards[currentCardIdx].back 
                                                    : flashcards[currentCardIdx].front
                                                }
                                            </h3>
                                        </div>

                                        {/* Card Navigation */}
                                        <div className="flex items-center gap-4">
                                            <Button 
                                                variant="outline" 
                                                disabled={currentCardIdx === 0}
                                                onClick={() => { setCurrentCardIdx(prev => prev - 1); setFlipped(false); }}
                                                className="h-10 px-4 rounded-xl font-bold text-xs uppercase"
                                            >
                                                Back
                                            </Button>
                                            <span className="text-xs font-bold text-slate-400">
                                                {currentCardIdx + 1} / {flashcards.length}
                                            </span>
                                            <Button 
                                                variant="outline" 
                                                disabled={currentCardIdx === flashcards.length - 1}
                                                onClick={() => { setCurrentCardIdx(prev => prev + 1); setFlipped(false); }}
                                                className="h-10 px-4 rounded-xl font-bold text-xs uppercase"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No flashcards loaded.</p>
                                )}
                            </Card>
                        )}

                        {/* Tab 4: Study Guides (Notes) */}
                        {activeTab === "notes" && (
                            <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div>
                                        <h3 className="font-extrabold text-lg uppercase tracking-tight">AI Generated <span className="text-indigo-600 dark:text-indigo-400 italic">Study Guide</span></h3>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Comprehensive theoretical summaries</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleCopyNotes} variant="outline" className="h-9 rounded-xl font-bold text-xs">
                                            <i className="bx bx-copy mr-1.5"  /> Copy Notes
                                        </Button>
                                        <Button size="sm" onClick={handleLoadNotes} disabled={notesLoading} variant="outline" className="h-9 rounded-xl font-bold text-xs">
                                            <i className="bx bx-refreshcw mr-1.5"  /> Re-Generate
                                        </Button>
                                    </div>
                                </div>

                                {notesLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                        <i className="bx bx-loader2 w-8 h-8 text-indigo-600 animate-spin mb-3"  />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Compiling notes markdown...</p>
                                    </div>
                                ) : notesText ? (
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-3xl markdown-content prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                        <ReactMarkdown>
                                            {notesText}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Notes compilation failed.</p>
                                )}
                            </Card>
                        )}

                    </div>
                )}
            </div>
        </ClassroomLayout>
    );
}

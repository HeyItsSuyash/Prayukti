"use client";

import React, { useState, useEffect } from "react";
import ClassroomLayout from "@/components/classroom/ClassroomLayout";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface KbItem {
    _id: string;
    subjectId: string;
    question: string;
    aiAnswer: string;
    teacherAnswer: string | null;
    reviewedBy: string | null;
    confidenceScore: number;
    status: string;
    createdAt: string;
}

export default function KnowledgeBasePage() {
    const [approvedList, setApprovedList] = useState<KbItem[]>([]);
    const [pendingList, setPendingList] = useState<KbItem[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSub, setSelectedSub] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Question form state
    const [question, setQuestion] = useState("");
    const [askLoading, setAskLoading] = useState(false);
    const [askResult, setAskResult] = useState<KbItem | null>(null);

    // Review form state
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [reviewLoading, setReviewLoading] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

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

    // Load Q&A when selected subject changes
    const loadKbData = async () => {
        if (!selectedSub) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('vlab_token');
            
            // 1. Fetch approved
            const aRes = await fetch(`${API_URL}/api/knowledge-base?subject_id=${selectedSub}`);
            if (aRes.ok) {
                setApprovedList(await aRes.ok ? await aRes.json() : []);
            }

            // 2. Fetch pending (if teacher)
            const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.role?.toLowerCase() === "admin";
            if (isTeacher) {
                const pRes = await fetch(`${API_URL}/api/knowledge-base/pending?subject_id=${selectedSub}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (pRes.ok) {
                    setPendingList(await pRes.json());
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSub) {
            loadKbData();
        }
    }, [selectedSub, user]);

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !selectedSub) return;

        setAskLoading(true);
        setAskResult(null);
        try {
            const token = localStorage.getItem('vlab_token');
            const res = await fetch(`${API_URL}/api/knowledge-base`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject_id: selectedSub,
                    question
                })
            });

            if (!res.ok) throw new Error("Failed to submit question");
            const data = await res.json();
            setAskResult(data);

            if (data.status === "approved") {
                // Prepend to approved list if auto-approved
                setApprovedList(prev => [data, ...prev]);
            } else {
                // Prepend to pending if student/teacher view updates
                setPendingList(prev => [data, ...prev]);
            }
            setQuestion("");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setAskLoading(false);
        }
    };

    const handleReviewQuestion = async (id: string) => {
        const text = answers[id];
        if (!text || !text.trim()) return;

        setReviewLoading(prev => ({ ...prev, [id]: true }));
        try {
            const token = localStorage.getItem('vlab_token');
            const res = await fetch(`${API_URL}/api/knowledge-base/${id}/review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ teacher_answer: text })
            });

            if (!res.ok) throw new Error("Failed to submit answer review");
            const updated = await res.json();

            // Move from pending list to approved list
            setPendingList(prev => prev.filter(p => p._id !== id));
            setApprovedList(prev => [updated, ...prev]);
            setAnswers(prev => ({ ...prev, [id]: "" }));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setReviewLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.role?.toLowerCase() === "admin";

    const filteredApproved = approvedList.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aiAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.teacherAnswer && item.teacherAnswer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <ClassroomLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Living <span className="text-indigo-600 dark:text-indigo-400 italic">Knowledge Base</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
                            {"Continuous loop Q&A repository. Ask a doubt -> AI replies -> Teacher answers if confidence low -> Future students get verified answers."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="font-bold text-xs uppercase text-slate-400 shrink-0">Subject:</Label>
                        <Select onValueChange={setSelectedSub} value={selectedSub}>
                            <SelectTrigger className="w-56 rounded-xl border-2">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {subjects.map((s) => (
                                    <SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Ask query form */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-sm p-6">
                            <div className="flex items-center gap-2 border-b pb-3 mb-4 border-slate-100 dark:border-slate-800">
                                <i className="bx bx-help-circle text-indigo-600 dark:text-indigo-400"  />
                                <h3 className="font-black text-sm uppercase tracking-tight">Ask the Knowledge Base</h3>
                            </div>

                            <form onSubmit={handleAskQuestion} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="q" className="font-bold text-xs uppercase text-slate-400">Your Question</Label>
                                    <Textarea 
                                        id="q"
                                        placeholder="E.g., Why does error-correction require redundancy check parity bits?"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        className="rounded-xl border-2 min-h-[100px] text-xs"
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={askLoading}
                                    className="w-full h-11 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-[9px] flex items-center gap-2"
                                >
                                    {askLoading ? <i className="bx bx-loader2 w-4 h-4 animate-spin mx-auto"  /> : "Query Database"}
                                </Button>
                            </form>
                        </Card>

                        {/* Query Result Card */}
                        {askResult && (
                            <Card className="rounded-3xl border-2 border-indigo-500/20 bg-indigo-50/5 dark:bg-indigo-950/10 p-6 animate-in slide-in-from-bottom-2 duration-300 space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-[9px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">AI Inference Result</span>
                                    <span className="text-[9px] font-bold border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        Confidence: {(askResult.confidenceScore * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100">Q: {askResult.question}</h4>
                                <div className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                    {askResult.aiAnswer}
                                </div>
                                {askResult.status === "pending_review" && (
                                    <div className="flex gap-1.5 items-start text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                        <i className="bx bx-clock shrink-0 mt-0.5"  />
                                        <span>AI confidence score is low. Question routed to subject teacher pending manual answers.</span>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>

                    {/* Right Columns: Approved QA & Pending Reviews */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Search and Approved Feed */}
                        <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h3 className="font-black text-lg uppercase tracking-tight">Verified Q&A <span className="text-indigo-600 dark:text-indigo-400 italic">Database</span></h3>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Approved answers cached for this classroom</p>
                                </div>

                                <div className="relative w-full md:w-64">
                                    <i className="bx bx-search absolute left-3 top-2.5 w-4 h-4 text-slate-400"  />
                                    <Input 
                                        placeholder="Search Q&As..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 text-xs rounded-xl border-2"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                                    <i className="bx bx-loader2 w-6 h-6 text-indigo-600 animate-spin mb-2"  />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Loading dataset...</p>
                                </div>
                            ) : filteredApproved.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredApproved.map((item) => (
                                        <div key={item._id} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
                                            <h4 className="font-extrabold text-slate-900 dark:text-white">Q: {item.question}</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
                                                    <span className="text-[9px] font-black uppercase text-indigo-500 block mb-1">AI Solution</span>
                                                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.aiAnswer}</p>
                                                </div>
                                                {item.teacherAnswer && (
                                                    <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/30 dark:border-indigo-900/30">
                                                        <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 block mb-1">Instructor verification</span>
                                                        <p className="text-slate-700 dark:text-indigo-300 font-medium leading-relaxed">{item.teacherAnswer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic text-center py-10">No verified Q&As match your query.</p>
                            )}
                        </Card>

                        {/* Pending Review Panel (Teacher Only) */}
                        {isTeacher && (
                            <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 border-amber-500/20">
                                <div className="flex items-center gap-2 border-b pb-4 mb-6 border-slate-100 dark:border-slate-800">
                                    <i className="bx bx-clock text-amber-500"  />
                                    <h3 className="font-black text-lg uppercase tracking-tight">Pending Teacher Reviews</h3>
                                </div>

                                {pendingList.length > 0 ? (
                                    <div className="space-y-4">
                                        {pendingList.map((item) => (
                                            <div key={item._id} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
                                                <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Student Question: {item.question}</h4>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`ans-${item._id}`} className="font-bold text-[10px] uppercase text-slate-400">Your Review Answer</Label>
                                                    <Textarea 
                                                        id={`ans-${item._id}`}
                                                        placeholder="Provide the correct theoretical or lab procedure explanation..."
                                                        value={answers[item._id] || ""}
                                                        onChange={(e) => setAnswers(prev => ({ ...prev, [item._id]: e.target.value }))}
                                                        className="rounded-xl border-2 min-h-[80px]"
                                                    />
                                                    <Button 
                                                        onClick={() => handleReviewQuestion(item._id)}
                                                        disabled={reviewLoading[item._id] || !answers[item._id]?.trim()}
                                                        className="h-9 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold uppercase text-[9px] tracking-wider"
                                                    >
                                                        {reviewLoading[item._id] ? <i className="bx bx-loader2 w-3.5 h-3.5 animate-spin"  /> : "Approve & Cache Answer"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic text-center py-10">No pending student questions in queue. Perfect alignment!</p>
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </ClassroomLayout>
    );
}

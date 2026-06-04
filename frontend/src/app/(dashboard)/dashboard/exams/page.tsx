"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    ArrowLeft, 
    BookOpen, 
    Calendar, 
    Clock, 
    AlertCircle, 
    Award, 
    Play, 
    CheckCircle2
} from "lucide-react";

export default function StudentExamsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const activeExams = [
        {
            id: "ex-1",
            title: "Computer Networks - Sessional Practical",
            subject: "Computer Networks",
            duration: "60 mins",
            date: "Today",
            timeWindow: "02:00 PM - 05:00 PM",
            status: "active"
        },
        {
            id: "ex-2",
            title: "Data Structures - Weekly Evaluation",
            subject: "Data Structures and Algorithms",
            duration: "45 mins",
            date: "Tomorrow",
            timeWindow: "10:00 AM - 12:00 PM",
            status: "upcoming"
        }
    ];

    const pastExams = [
        {
            id: "ex-past-1",
            title: "Digital Logic Design - Lab Test 1",
            subject: "Digital Logic & Design",
            score: "85 / 100",
            status: "completed",
            submittedAt: "May 28, 2026"
        },
        {
            id: "ex-past-2",
            title: "C Programming - Basic Evaluation",
            subject: "C Programming Lab",
            score: "92 / 100",
            status: "completed",
            submittedAt: "May 15, 2026"
        }
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem("vlab_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            window.location.href = "/login";
        }
        setLoading(false);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
            <Navbar />

            <main className="container mx-auto px-4 pt-28 pb-20 max-w-7xl">
                {/* Header */}
                <div className="animate-in fade-in slide-in-from-left duration-500 mb-12">
                    <Button 
                        variant="ghost" 
                        onClick={() => window.location.href = "/dashboard"}
                        className="flex items-center gap-2 mb-4 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Button>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                        Exam <span className="text-accent italic">Portal</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">
                        View assignedTimed examinations, sessional evaluations, and past scores.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active/Upcoming Exams */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-slate-900 dark:text-white">Active & Upcoming Evaluations</h3>
                        
                        {activeExams.map((exam) => (
                            <Card key={exam.id} className={`border-2 rounded-[2rem] overflow-hidden ${
                                exam.status === "active" ? "border-accent/30 shadow-lg" : "border-slate-200"
                            }`}>
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${
                                                    exam.status === "active" ? "bg-accent animate-pulse" : "bg-slate-400"
                                                }`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    {exam.status === "active" ? "Active Evaluation" : "Upcoming"}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                                {exam.title}
                                            </h4>
                                            <p className="text-sm font-semibold text-slate-500">
                                                {exam.subject}
                                            </p>
                                            
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 pt-2">
                                                <span className="flex items-center gap-1"><Clock size={14} /> {exam.duration}</span>
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {exam.timeWindow}</span>
                                            </div>
                                        </div>

                                        <Button className={`h-12 px-8 uppercase font-black tracking-widest text-xs rounded-xl shadow-md ${
                                            exam.status === "active" 
                                                ? "bg-accent hover:bg-accent/90 text-white" 
                                                : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                        }`}>
                                            <Play size={12} className="mr-2" /> Start Exam
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Past Exams / Grades */}
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-slate-900 dark:text-white">Past Submissions</h3>
                        <Card className="border-2 rounded-[2.5rem] p-6 space-y-6">
                            {pastExams.map((exam) => (
                                <div key={exam.id} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{exam.title}</h4>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{exam.submittedAt}</p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                                            <Award size={14} className="text-accent" />
                                            {exam.score}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">Graded</span>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

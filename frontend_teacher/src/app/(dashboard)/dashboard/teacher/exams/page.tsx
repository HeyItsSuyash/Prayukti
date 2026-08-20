"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


export default function TeacherExamsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([
        {
            id: "ex-1",
            title: "Computer Networks - Sessional Practical",
            subject: "Computer Networks",
            duration: "60 mins",
            timeWindow: "02:00 PM - 05:00 PM",
            enrolledStudents: 62,
            submissions: 48
        },
        {
            id: "ex-2",
            title: "Data Structures - Weekly Evaluation",
            subject: "Data Structures and Algorithms",
            duration: "45 mins",
            timeWindow: "10:00 AM - 12:00 PM",
            enrolledStudents: 64,
            submissions: 0
        }
    ]);

    useEffect(() => {
        const storedUser = localStorage.getItem("vlab_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            window.location.href = "/login";
        }
        setLoading(false);
    }, []);

    const deleteExam = (id: string) => {
        setExams(exams.filter(e => e.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
            <Navbar />

            <main className="container mx-auto px-4 pt-28 pb-20 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-in fade-in slide-in-from-left duration-500">
                    <div>
                        <Button 
                            variant="ghost" 
                            onClick={() => window.location.href = "/dashboard"}
                            className="flex items-center gap-2 mb-4 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]"
                        >
                            <i className="bx bx-arrowleft"  /> Back to Dashboard
                        </Button>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Manage <span className="text-accent italic">Exams</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">
                            Schedule, review, and evaluate virtual lab practical exams and quizzes.
                        </p>
                    </div>

                    <Button 
                        className="bg-accent text-white hover:bg-accent/90 px-6 h-12 rounded-xl uppercase font-black tracking-widest text-xs flex items-center gap-2"
                    >
                        <i className="bx bx-plus"  /> Schedule New Exam
                    </Button>
                </div>

                {/* Exams List Card */}
                <Card className="border-2 rounded-[2.5rem] overflow-hidden ">
                    <CardHeader className="p-8 border-b">
                        <CardTitle className="uppercase font-black tracking-tight text-xl">Active & Scheduled Examinations</CardTitle>
                        <CardDescription>View status, duration, and student submission statistics.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest pl-8">Exam Details</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Subject</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Time Slot</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Submissions</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest pr-8 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                                            No active exams scheduled.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exams.map((exam) => (
                                        <TableRow key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <TableCell className="pl-8 py-4 font-bold">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 dark:text-white">{exam.title}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-wider">{exam.duration}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-500 font-semibold text-sm">
                                                {exam.subject}
                                            </TableCell>
                                            <TableCell className="text-slate-500 font-semibold text-xs">
                                                {exam.timeWindow}
                                            </TableCell>
                                            <TableCell className="text-slate-900 dark:text-white font-bold text-sm">
                                                <span className="flex items-center gap-1">
                                                    <i className="bx bx-group text-slate-400"  />
                                                    {exam.submissions} / {exam.enrolledStudents}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-8 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        <i className="bx bx-eye"  />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => deleteExam(exam.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                        <i className="bx bx-trash2"  />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
}

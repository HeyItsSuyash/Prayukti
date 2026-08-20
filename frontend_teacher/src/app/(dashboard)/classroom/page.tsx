"use client";

import React, { useState, useEffect } from "react";
import ClassroomLayout from "@/components/classroom/ClassroomLayout";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function ClassroomDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchDashboard = async () => {
            try {
                
                const res = await fetch(`${API_URL}/api/classroom/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`
                    }
                });

                if (!res.ok) throw new Error("Failed to load classroom stats");
                const stats = await res.json();
                setData(stats);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.role?.toLowerCase() === "admin";

    return (
        <ClassroomLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Classroom Sync Active</p>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Classroom <span className="text-indigo-600 dark:text-indigo-400 italic">Overview</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2 max-w-xl">
                            {isTeacher 
                                ? "Manage your class schedules, publish lecture announcements, and check AI-computed student participation insights."
                                : "Check today's live classes, review recent subject announcements, and study with your personalized AI Tutor."
                            }
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <i className="bx bx-loader2 w-10 h-10 text-[#059669] animate-spin mb-4"  />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Synchronizing classroom variables...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 p-6 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400">
                        <i className="bx bx-alertcircle shrink-0"  />
                        <p className="font-semibold text-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* AI Video Tutor Banner */}
                        <div className="border border-indigo-100/50 dark:border-indigo-900/30 rounded-3xl p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex flex-col md:flex-row justify-between items-center gap-4  mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <i className="bx bx-sparkles text-indigo-200 animate-pulse"  />
                                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-200">New Feature Active</span>
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight mt-1">
                                    AI Video Tutor: Virtual Professor
                                </h3>
                                <p className="text-indigo-100 text-xs mt-1 font-semibold">
                                    Generate personalized visual lectures, logic diagrams, and step-by-step simulations on demand for any syllabus topic.
                                </p>
                            </div>
                            <a href="/video-tutor" className="shrink-0">
                                <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold uppercase tracking-widest text-[9px] px-6 h-11 rounded-xl">
                                    Launch Video Tutor
                                </Button>
                            </a>
                        </div>

                        {/* Stats Dashboard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {isTeacher ? (
                                <>
                                    <Card className="rounded-3xl border-2 hover:border-slate-300 dark:hover:border-slate-700  bg-white dark:bg-slate-900">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Enrolled</span>
                                                <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                                    <i className="bx bx-bookopen"  />
                                                </div>
                                            </div>
                                            <h2 className="text-4xl font-black">{data.totalStudents}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Students assigned to your batches</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-3xl border-2 hover:border-slate-300 dark:hover:border-slate-700  bg-white dark:bg-slate-900">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Active Today</span>
                                                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                                    <i className="bx bx-activity"  />
                                                </div>
                                            </div>
                                            <h2 className="text-4xl font-black">{data.activeStudentsToday}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Students active in the past 24 hours</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-3xl border-2 hover:border-slate-300 dark:hover:border-slate-700  bg-white dark:bg-slate-900">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Today's Classes</span>
                                                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                                    <i className="bx bx-calendar"  />
                                                </div>
                                            </div>
                                            <h2 className="text-4xl font-black">{data.classesToday?.length || 0}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Scheduled live lecture sessions</p>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <>
                                    <Card className="rounded-3xl border-2 hover:border-slate-300 dark:hover:border-slate-700  bg-white dark:bg-slate-900">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Attendance Index</span>
                                                <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                                    <i className="bx bx-calendar"  />
                                                </div>
                                            </div>
                                            <h2 className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{data.attendanceRate || "80.0%"}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Monthly class join consistency rate</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-3xl border-2 hover:border-slate-300 dark:hover:border-slate-700  bg-white dark:bg-slate-900">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Engagement Score</span>
                                                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                                    <i className="bx bx-activity"  />
                                                </div>
                                            </div>
                                            <h2 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{data.engagementScore || 75} <span className="text-xs text-slate-400">/ 100</span></h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">AI-computed weekly participation score</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-3xl border-2 hover:border-slate-300 dark:hover:border-slate-700  bg-white dark:bg-slate-900">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Pending Exams</span>
                                                <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                                                    <i className="bx bx-alertcircle"  />
                                                </div>
                                            </div>
                                            <h2 className="text-4xl font-black text-amber-600 dark:text-amber-400">{data.pendingExams || 0}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Active timed evaluations remaining</p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>

                        {/* Main Grid: Today's Classes & Announcements */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Today's Schedule Card */}
                            <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 overflow-hidden  hover: transition-shadow">
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Today's <span className="text-indigo-600 dark:text-indigo-400 italic">Classes</span></h2>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">Live scheduled virtual slots</p>
                                    </div>
                                    <a href="/classroom/timetable">
                                        <Button variant="ghost" size="sm" className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                                            Weekly Timetable <i className="bx bx-right-arrow-alt"  />
                                        </Button>
                                    </a>
                                </div>
                                <CardContent className="p-8 space-y-4">
                                    {data.classesToday && data.classesToday.length > 0 ? (
                                        data.classesToday.map((c: any) => {
                                            const classTime = new Date(c.scheduledTime);
                                            return (
                                                <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                                                            <i className="bx bx-clock"  />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{c.className}</h4>
                                                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                                                {isTeacher ? `Subject Class` : `Instructor: ${c.teacherName}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <span className="text-xs font-black tracking-tight text-slate-600 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                                                            {classTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <a href={c.roomLink} target="_blank" rel="noopener noreferrer">
                                                            <Button size="sm" className="h-8 rounded-lg text-[10px] uppercase font-black tracking-widest bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-200">
                                                                Join
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <i className="bx bx-calendar w-12 h-12 text-slate-300 mb-3"  />
                                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase text-xs tracking-wider">No Classes Scheduled Today</h4>
                                            <p className="text-xs text-slate-400 max-w-xs mt-2 font-medium">Check the timetable section for upcoming scheduled slots this week.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Announcements Card */}
                            <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 overflow-hidden  hover: transition-shadow">
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Recent <span className="text-indigo-600 dark:text-indigo-400 italic">Announcements</span></h2>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">Syllabus updates & course bulletins</p>
                                    </div>
                                    <a href="/classroom/announcements">
                                        <Button variant="ghost" size="sm" className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                                            Announcement Feed <i className="bx bx-right-arrow-alt"  />
                                        </Button>
                                    </a>
                                </div>
                                <CardContent className="p-8 space-y-4">
                                    {data.announcements && data.announcements.length > 0 ? (
                                        data.announcements.map((a: any) => (
                                            <div key={a.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 ">
                                                <div className="flex items-start gap-3 justify-between">
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                                                            <i className="bx bx-megaphone"  />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{a.title}</h4>
                                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                                Instructor: {a.teacherName || "Subject Faculty"} • {new Date(a.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-3 line-clamp-2">
                                                    {a.content}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <i className="bx bx-megaphone w-12 h-12 text-slate-300 mb-3"  />
                                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase text-xs tracking-wider">No Recent Announcements</h4>
                                            <p className="text-xs text-slate-400 max-w-xs mt-2 font-medium">Announcements posted by your subject teachers will be compiled here.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>
                    </>
                )}
            </div>
        </ClassroomLayout>
    );
}

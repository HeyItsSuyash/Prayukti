"use client";

import React, { useState, useEffect } from "react";
import ClassroomLayout from "@/components/classroom/ClassroomLayout";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface TimetableEntry {
    _id: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    roomLink: string;
    recurring: boolean;
}

export default function TimetablePage() {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);
    
    // AI state
    const [aiRecs, setAiRecs] = useState<any>(null);
    const [aiOverloads, setAiOverloads] = useState<any>(null);
    const [showAiModal, setShowAiModal] = useState(false);

    // Form state
    const [selectedSubject, setSelectedSubject] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState("Monday");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [roomLink, setRoomLink] = useState("");
    const [recurring, setRecurring] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchData = async () => {
            try {
                
                
                // Fetch timetable
                const tRes = await fetch(`${API_URL}/api/timetable`, {
                    headers: { 'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}` }
                });
                if (!tRes.ok) throw new Error("Failed to fetch schedules");
                const tData = await tRes.json();
                setTimetable(tData);

                // Fetch subjects
                const sRes = await fetch(`${API_URL}/api/subjects`);
                if (sRes.ok) {
                    const sData = await sRes.json();
                    setSubjects(sData);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.role?.toLowerCase() === "admin";

    const handleCreateEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubject || !roomLink) return;

        setSubmitLoading(true);
        setError("");

        try {
            
            const res = await fetch(`${API_URL}/api/timetable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject_id: selectedSubject,
                    day_of_week: dayOfWeek,
                    start_time: startTime,
                    end_time: endTime,
                    room_link: roomLink,
                    recurring
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to create timetable slot");
            }

            const newEntry = await res.json();
            setTimetable((prev) => [...prev, newEntry]);
            setDialogOpen(false);
            setRoomLink("");
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this scheduled slot?")) return;

        try {
            
            const res = await fetch(`${API_URL}/api/timetable/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}` }
            });

            if (!res.ok) throw new Error("Failed to delete slot");
            setTimetable((prev) => prev.filter((t) => t._id !== id));
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleAiOptimize = async () => {
        setLoading(true);
        try {
            
            const recRes = await fetch(`${API_URL}/api/timetable/ai-optimize`, {
                headers: { 'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}` }
            });
            const overRes = await fetch(`${API_URL}/api/timetable/overload`, {
                headers: { 'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}` }
            });

            if (recRes.ok && overRes.ok) {
                setAiRecs(await recRes.json());
                setAiOverloads(await overRes.json());
                setShowAiModal(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return (
        <ClassroomLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Subject <span className="text-indigo-600 dark:text-indigo-400 italic">Timetable</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
                            Weekly academic calendar matrix. Scheduled lecture meetings map directly here.
                        </p>
                    </div>

                    <div className="flex gap-3 items-center">
                        {!isTeacher && (
                            <Button 
                                onClick={handleAiOptimize}
                                className="h-12 px-6 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                            >
                                <i className="bx bx-sparkles animate-pulse"  />
                                AI Schedule Assistant
                            </Button>
                        )}

                        {isTeacher && (
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 px-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <i className="bx bx-plus"  /> Add Timetable Slot
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-3xl border-2 max-w-md bg-white dark:bg-slate-900">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Add Timetable Slot</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateEntry} className="space-y-4 pt-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="subject" className="font-bold text-xs uppercase text-slate-400">Subject</Label>
                                            <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                                                <SelectTrigger className="rounded-xl border-2 focus:ring-0">
                                                    <SelectValue placeholder="Select Subject" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    {subjects.map((s) => (
                                                        <SelectItem key={s._id} value={s._id}>{s.title} ({s.branch})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="day" className="font-bold text-xs uppercase text-slate-400">Day of Week</Label>
                                                <Select onValueChange={setDayOfWeek} value={dayOfWeek}>
                                                    <SelectTrigger className="rounded-xl border-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {days.map((d) => (
                                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5 flex items-center gap-2 pt-6">
                                                <input 
                                                    type="checkbox" 
                                                    id="recurring" 
                                                    checked={recurring}
                                                    onChange={(e) => setRecurring(e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 border-2 rounded focus:ring-0 cursor-pointer"
                                                />
                                                <Label htmlFor="recurring" className="font-bold text-xs uppercase text-slate-500 cursor-pointer select-none">Recurring Class</Label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="start" className="font-bold text-xs uppercase text-slate-400">Start Time</Label>
                                                <Input 
                                                    type="time" 
                                                    id="start" 
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="rounded-xl border-2"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="end" className="font-bold text-xs uppercase text-slate-400">End Time</Label>
                                                <Input 
                                                    type="time" 
                                                    id="end" 
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="rounded-xl border-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="link" className="font-bold text-xs uppercase text-slate-400">Room Join Link (Zoom / Meet)</Label>
                                            <Input 
                                                type="url" 
                                                id="link" 
                                                placeholder="https://meet.google.com/abc-defg-hij"
                                                value={roomLink}
                                                onChange={(e) => setRoomLink(e.target.value)}
                                                className="rounded-xl border-2"
                                                required
                                            />
                                        </div>

                                        {error && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs font-bold">
                                                <i className="bx bx-alerttriangle shrink-0"  />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        <Button 
                                            type="submit" 
                                            disabled={submitLoading}
                                            className="w-full h-12 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-[10px]"
                                        >
                                            {submitLoading ? <i className="bx bx-loader2 w-4 h-4 animate-spin mx-auto"  /> : "Publish Slot"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <i className="bx bx-loader2 w-10 h-10 text-[#059669] animate-spin mb-4"  />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Synchronizing schedules...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {days.map((day) => {
                            const dayEntries = timetable.filter(t => t.dayOfWeek.toLowerCase() === day.toLowerCase());
                            return (
                                <Card key={day} className="rounded-3xl border-2 overflow-hidden bg-white dark:bg-slate-900">
                                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">{day}</h3>
                                    </div>
                                    <CardContent className="p-6">
                                        {dayEntries.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {dayEntries.map((entry) => {
                                                    const sub = subjects.find(s => s._id === entry.subjectId);
                                                    return (
                                                        <div key={entry._id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                                            <div>
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h4 className="font-black text-sm text-indigo-600 dark:text-indigo-400 truncate">{sub ? sub.title : "Subject Class"}</h4>
                                                                    {entry.recurring && (
                                                                        <span className="text-[9px] font-black uppercase tracking-widest bg-slate-200/60 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">Weekly</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs mb-3">
                                                                    <i className="bx bx-clock"  />
                                                                    <span>{entry.startTime} - {entry.endTime}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                                                                <a href={entry.roomLink} target="_blank" rel="noopener noreferrer">
                                                                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] uppercase font-bold tracking-widest">
                                                                        Room Link
                                                                    </Button>
                                                                </a>
                                                                {isTeacher && (
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost" 
                                                                        onClick={() => handleDeleteEntry(entry._id)}
                                                                        className="h-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] font-bold"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 font-medium italic">No classes scheduled on this day.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* AI Optimization Dialog */}
            <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
                <DialogContent className="rounded-[2rem] border-2 max-w-2xl bg-white dark:bg-slate-900 overflow-y-auto max-h-[80vh] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <i className="bx bx-sparkles animate-pulse"  />
                            AI Classroom Scheduler
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 pt-4">
                        {/* Conflict Optimization Recommendations */}
                        <div>
                            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-3">Optimized Schedule Recommendations</h3>
                            <div className="space-y-3">
                                {aiRecs?.recommendations?.map((rec: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 rounded-2xl">
                                        <h4 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-300">{rec.subjectTitle}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Suggested Slot: **{rec.recommendedDay} at {rec.recommendedTime}**</p>
                                        <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium mt-2">{rec.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overloaded Days Analysis */}
                        <div>
                            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-3">Daily Instruction Overload Predictor</h3>
                            <div className="space-y-3">
                                {aiOverloads?.map((pred: any, idx: number) => (
                                    <div key={idx} className={`p-4 border rounded-2xl ${
                                        pred.status === "Severely Overloaded" 
                                            ? "bg-red-50/50 dark:bg-red-950/20 border-red-100/60 dark:border-red-900/30 text-red-800 dark:text-red-300"
                                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                                    }`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-extrabold text-sm">{pred.day}</span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border">{pred.status}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{pred.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </ClassroomLayout>
    );
}

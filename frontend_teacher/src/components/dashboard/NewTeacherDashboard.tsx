"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
    Users, 
    BookOpen, 
    Sparkles, 
    FileText, 
    Calendar, 
    Plus, 
    Send, 
    CheckCircle2, 
    Play, 
    BarChart2, 
    Clock, 
    HelpCircle,
    ArrowRight
} from "lucide-react";

export function NewTeacherDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalSchedules: 0,
        totalAnnouncements: 0,
        totalResources: 0,
        totalStudents: 0
    });
    const [schedules, setSchedules] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    // Modals
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

    // Form inputs
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [className, setClassName] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [attachedResource, setAttachedResource] = useState("Unit 2 ARP_RARP.pdf");

    // Announcement input
    const [announceTitle, setAnnounceTitle] = useState("");
    const [announceContent, setAnnounceContent] = useState("");

    // AI Question Generator states
    const [questionCount, setQuestionCount] = useState(5);
    const [questionType, setQuestionType] = useState("MCQ");
    const [difficulty, setDifficulty] = useState("Medium");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
    const [quizApproved, setQuizApproved] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            if (u.role?.toLowerCase() !== 'teacher' && u.role?.toLowerCase() !== 'admin') {
                window.location.href = '/login';
                return;
            }
            setUser(u);
        } else {
            window.location.href = '/login';
            return;
        }

        fetchDashboardData();
        fetchSubjects();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('vlab_access_token') || '';
            const res = await fetch(`${API_URL}/api/teacher/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const d = await res.json();
                setStats(d.stats || {});
                setSchedules(d.upcomingSchedules || []);
                setAnnouncements(d.recentAnnouncements || []);
            }
        } catch (err) {
            console.error('Error loading teacher dashboard:', err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${API_URL}/api/subjects`);
            if (res.ok) {
                const subs = await res.json();
                setSubjects(subs);
                if (subs.length > 0) setSelectedSubjectId(subs[0]._id || subs[0].id);
            }
        } catch (err) {
            console.error('Failed to load subjects:', err);
        }
    };

    const handleCreateSmartClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('vlab_access_token') || '';
            const res = await fetch(`${API_URL}/api/teacher/smart-class`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject_id: selectedSubjectId,
                    class_name: className,
                    scheduled_time: scheduledTime || new Date().toISOString(),
                    duration_minutes: 60,
                    room_link: "https://meet.google.com/prayukti-vlab",
                    batch: "CSE-B"
                })
            });

            if (res.ok) {
                setIsCreateClassOpen(false);
                setClassName("");
                fetchDashboardData();
            }
        } catch (err) {
            console.error('Failed to schedule smart class:', err);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('vlab_access_token') || '';
            const res = await fetch(`${API_URL}/api/teacher/announcement`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject_id: selectedSubjectId,
                    title: announceTitle,
                    content: announceContent
                })
            });

            if (res.ok) {
                setIsAnnouncementOpen(false);
                setAnnounceTitle("");
                setAnnounceContent("");
                fetchDashboardData();
            }
        } catch (err) {
            console.error('Failed to post announcement:', err);
        }
    };

    const handleGenerateQuestions = async () => {
        setIsGenerating(true);
        try {
            const token = localStorage.getItem('vlab_access_token') || '';
            const res = await fetch(`${API_URL}/api/teacher/generate-questions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resource_title: attachedResource,
                    count: questionCount,
                    question_type: questionType,
                    difficulty: difficulty
                })
            });

            if (res.ok) {
                const data = await res.json();
                setGeneratedQuestions(data.questions || []);
            }
        } catch (err) {
            console.error('Question generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('vlab_user');
        localStorage.removeItem('vlab_access_token');
        fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {});
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            {/* Header Navigation */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-xl">
                        P
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            Teacher Control Center
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase">Faculty View</span>
                        </h1>
                        <p className="text-xs text-slate-500">Welcome, {user?.fullName || "Educator"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsCreateClassOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs gap-1.5 shadow-md shadow-blue-600/20">
                        <Plus className="w-4 h-4" /> Schedule Smart Class
                    </Button>
                    <Button onClick={() => setIsAnnouncementOpen(true)} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 text-xs gap-1.5">
                        <Send className="w-4 h-4" /> Post Announcement
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <i className="bx bx-log-out text-xl" />
                    </Button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Workflow Architecture Card */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/15 relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl space-y-3">
                        <div className="flex items-center gap-2 text-blue-200 font-bold text-xs uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 animate-pulse" /> Resource-Driven Smart Class Architecture
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                            Teachers teach from resources. AI turns resources into questions. Smart Classes deliver them to students.
                        </h2>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Upload your lecture slides or notes to automatically generate approved draft quizzes, attach them to your live session, and receive real-time student activity.
                        </p>
                        <div className="pt-2 flex flex-wrap items-center gap-4">
                            <Button onClick={() => setIsAiGeneratorOpen(true)} className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-xs px-5 py-2.5 shadow-lg">
                                <Sparkles className="w-4 h-4 mr-1.5 text-blue-600" /> Open AI Question Generator
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Metrics Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { title: "Smart Classes Scheduled", value: stats.totalSchedules || 2, sub: "Upcoming sessions", icon: Calendar, color: "text-blue-600" },
                        { title: "Announcements Shared", value: stats.totalAnnouncements || 4, sub: "Broadcast to students", icon: Send, color: "text-indigo-600" },
                        { title: "Teaching Resources", value: stats.totalResources || 8, sub: "PDFs, Notes & Material", icon: FileText, color: "text-sky-600" },
                        { title: "Enrolled Students", value: stats.totalStudents || 45, sub: "Active section CSE-B", icon: Users, color: "text-emerald-600" }
                    ].map((item, idx) => (
                        <Card key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.title}</CardTitle>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900 dark:text-white">{item.value}</div>
                                <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Two-Column Section: Upcoming Smart Classes & AI Question Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Smart Classes */}
                    <Card className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Smart Classes & Teaching Sessions</CardTitle>
                                <CardDescription>Scheduled sessions and attached resources</CardDescription>
                            </div>
                            <Button onClick={() => setIsCreateClassOpen(true)} size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs">
                                <Plus className="w-3.5 h-3.5 mr-1" /> New Class
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {schedules.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-slate-600">No live classes scheduled for today</p>
                                    <Button onClick={() => setIsCreateClassOpen(true)} size="sm" className="mt-3 bg-blue-600 text-white text-xs">
                                        Schedule First Class
                                    </Button>
                                </div>
                            ) : (
                                schedules.map((s, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 font-bold text-[10px] rounded-full uppercase">{s.subjectTitle || "Computer Networks"}</span>
                                                <span className="text-xs font-semibold text-slate-500">CSE-B</span>
                                            </div>
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{s.className}</h4>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <FileText className="w-3 h-3 text-blue-500" /> Attached: ARP_RARP_Notes.pdf
                                            </p>
                                        </div>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1 shrink-0">
                                            <Play className="w-3 h-3 fill-current" /> Start Class
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: AI Question Generation Workflow */}
                    <Card className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-600" /> AI Activity Generator
                                </CardTitle>
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-full uppercase">Draft Mode</span>
                            </div>
                            <CardDescription>Select resource to generate structured quiz questions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Active Teaching Resource</label>
                                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{attachedResource}</p>
                                        <p className="text-[10px] text-slate-400">Attached to Computer Networks - CSE-B</p>
                                    </div>
                                    <Button onClick={() => setIsAiGeneratorOpen(true)} size="sm" className="bg-blue-600 text-white font-bold text-xs">
                                        Generate
                                    </Button>
                                </div>
                            </div>

                            {quizApproved ? (
                                <div className="p-4 border border-emerald-200 bg-emerald-50/50 text-emerald-800 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold">Quiz Approved & Published to Class</p>
                                        <p className="text-[10px] text-emerald-600">Students in CSE-B will receive this quiz when the Smart Class starts.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                                    Click "Generate" to generate AI questions from your resource.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Schedule Class Modal */}
            <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Schedule Smart Class</DialogTitle>
                        <DialogDescription>Create a live class and link teaching resources.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSmartClass} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Topic / Class Name</label>
                            <Input
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                placeholder="e.g. Computer Networks - ARP & RARP Protocol"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Scheduled Date & Time</label>
                            <Input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCreateClassOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 text-white font-bold">Schedule Class</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Post Announcement Modal */}
            <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Post Class Announcement</DialogTitle>
                        <DialogDescription>Send broadcast notification to assigned students.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Title</label>
                            <Input
                                value={announceTitle}
                                onChange={(e) => setAnnounceTitle(e.target.value)}
                                placeholder="e.g. Unit 2 Quiz Scheduled for Tomorrow"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Announcement Content</label>
                            <textarea
                                value={announceContent}
                                onChange={(e) => setAnnounceContent(e.target.value)}
                                rows={4}
                                placeholder="Please review ARP.pdf resource before joining live Smart Class."
                                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-600"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAnnouncementOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 text-white font-bold">Post Announcement</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* AI Question Generator Modal */}
            <Dialog open={isAiGeneratorOpen} onOpenChange={setIsAiGeneratorOpen}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-600" /> AI Question Generator
                        </DialogTitle>
                        <DialogDescription>Generate and review questions from attached resource.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-2">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Questions Count</label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Question Type</label>
                                <div className="p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50">
                                    Multiple Choice (MCQ)
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Difficulty Level</label>
                                <div className="p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50">
                                    Medium / Mixed
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleGenerateQuestions} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            {isGenerating ? "Extracting Resource Content..." : "Generate AI Questions"}
                        </Button>

                        {generatedQuestions.length > 0 && (
                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Generated Question Drafts ({generatedQuestions.length})</h4>
                                <div className="space-y-3">
                                    {generatedQuestions.map((q, idx) => (
                                        <div key={idx} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{q.question}</p>
                                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                                                {q.options?.map((opt: string, i: number) => (
                                                    <span key={i} className="p-1.5 bg-white border border-slate-200 rounded-md font-mono">{opt}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button 
                                    onClick={() => {
                                        setQuizApproved(true);
                                        setIsAiGeneratorOpen(false);
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Approve Quiz & Attach to Smart Class
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

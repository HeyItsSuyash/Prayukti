"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VideoTutorLayout from "@/components/video-tutor/VideoTutorLayout";
import { API_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function VideoTutorDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"ask" | "lessons" | "saved" | "history" | "analytics">("ask");
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [topic, setTopic] = useState("");
    const [mode, setMode] = useState("beginner");
    const [avatar, setAvatar] = useState("professor");
    const [voice, setVoice] = useState("male_voice_1");
    const [language, setLanguage] = useState("English");
    const [generating, setGenerating] = useState(false);
    const [genStep, setGenStep] = useState(0);

    // Lists
    const [lessons, setLessons] = useState<any[]>([]);
    const [savedLessons, setSavedLessons] = useState<any[]>([]);
    const [watchHistory, setWatchHistory] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);

    // Pipeline generation steps
    const generationSteps = [
        "Analyzing Query...",
        "Structuring Lesson Plan...",
        "Writing Script Outlines...",
        "Generating Slide Decks...",
        "Composing Schematics...",
        "Assembling SVG Animations...",
        "Synthesizing AI Narrations...",
        "Finalizing Video Compiles..."
    ];

    const fetchAllData = async () => {
        setLoading(true);
        try {
            
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch generated lessons
            const lRes = await fetch(`${API_URL}/api/video-tutor/lessons`, { headers });
            if (lRes.ok) setLessons(await lRes.json());

            // 2. Fetch saved lessons
            const sRes = await fetch(`${API_URL}/api/video-tutor/saved`, { headers });
            if (sRes.ok) setSavedLessons(await sRes.json());

            // 3. Fetch watch history
            const hRes = await fetch(`${API_URL}/api/video-tutor/history`, { headers });
            if (hRes.ok) setWatchHistory(await hRes.json());

            // 4. Fetch analytics
            const aRes = await fetch(`${API_URL}/api/video-tutor/analytics`, { headers });
            if (aRes.ok) setAnalytics(await aRes.json());
        } catch (e) {
            console.error("Failed to load video tutor data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [activeTab]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setGenerating(true);
        setGenStep(0);

        // Simulated visual pipeline step loader
        const interval = setInterval(() => {
            setGenStep(prev => {
                if (prev < generationSteps.length - 1) {
                    return prev + 1;
                } else {
                    clearInterval(interval);
                    return prev;
                }
            });
        }, 1200);

        try {
            
            const res = await fetch(`${API_URL}/api/video-tutor/generate`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ topic, mode, avatar, voice, language })
            });

            if (!res.ok) throw new Error("Generation pipeline failed");
            const data = await res.json();
            clearInterval(interval);
            router.push(`/video-tutor/lesson/${data.lesson._id}`);
        } catch (err: any) {
            clearInterval(interval);
            alert(err.message);
            setGenerating(false);
        }
    };

    // Radar chart dataset for 4 target scores
    const radarData = analytics ? [
        { subject: "Knowledge Score", value: analytics.scores.knowledgeScore },
        { subject: "Concept Mastery", value: analytics.scores.conceptMasteryScore },
        { subject: "Engagement Index", value: analytics.scores.engagementScore },
        { subject: "Learning Growth", value: analytics.scores.learningGrowthScore }
    ] : [
        { subject: "Knowledge Score", value: 70 },
        { subject: "Concept Mastery", value: 65 },
        { subject: "Engagement Index", value: 80 },
        { subject: "Learning Growth", value: 75 }
    ];

    return (
        <VideoTutorLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Hub Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            AI Video <span className="text-indigo-600 dark:text-indigo-400 italic">Tutor</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
                            Instant AI generated custom visual lessons. Learn concepts with animated circuits, trees, and logic models.
                        </p>
                    </div>
                </div>

                {/* Sub-tab switcher */}
                <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-2">
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("ask")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "ask" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-sparkles mr-2"  /> Ask Professor
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("lessons")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "lessons" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-video mr-2"  /> Generated Lessons
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("saved")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "saved" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-bookmark mr-2"  /> Bookmarks
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("history")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "history" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-history mr-2"  /> History
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("analytics")}
                        className={`h-12 px-6 rounded-t-2xl rounded-b-none font-bold text-xs uppercase tracking-wider ${
                            activeTab === "analytics" 
                                ? "border-b-2 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white" 
                                : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        <i className="bx bx-linechart mr-2"  /> Tutor Analytics
                    </Button>
                </div>

                {/* Main section */}
                {generating ? (
                    // Loader screen for compilation pipeline
                    <Card className="rounded-[3rem] border-2 bg-white dark:bg-slate-900 p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden min-h-[400px]">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <i className="bx bx-loader2 w-16 h-16 text-indigo-600 animate-spin mb-6"  />
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                            Rendering AI Video Lesson
                        </h3>
                        <p className="text-slate-400 font-semibold text-sm max-w-sm mt-2">
                            Please wait while our LLM synthesizer compiles slide layouts, mermaid node diagrams, and SVG logic animations.
                        </p>
                        
                        {/* Current Compilation pipeline step */}
                        <div className="mt-8 bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 min-w-[280px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 block mb-1">
                                Pipeline State
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 animate-pulse">
                                {generationSteps[genStep]}
                            </span>
                        </div>
                    </Card>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <i className="bx bx-loader2 w-10 h-10 text-indigo-600 animate-spin mb-4"  />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Loading Tutor logs...</p>
                    </div>
                ) : (
                    <div className="min-h-[400px]">
                        
                        {/* Tab 1: Ask Professor */}
                        {activeTab === "ask" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 lg:col-span-2">
                                    <div className="flex items-center gap-2 border-b pb-4 mb-6 border-slate-100 dark:border-slate-800">
                                        <i className="bx bx-sparkles text-indigo-600 dark:text-indigo-400"  />
                                        <h3 className="font-black text-sm uppercase tracking-tight">Configure Video Prompt</h3>
                                    </div>

                                    <form onSubmit={handleGenerate} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="t" className="font-extrabold text-xs uppercase text-slate-400">What concept would you like to learn?</Label>
                                            <Input 
                                                id="t"
                                                placeholder="E.g., Explain Half Adder OR Teach me Binary Search Tree"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="rounded-xl border-2 h-12 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                required
                                            />
                                            <p className="text-[10px] text-slate-400">
                                                Tip: Standard topics like &quot;Half Adder&quot;, &quot;Binary Search Tree&quot;, &quot;TCP 3-Way Handshake&quot;, and &quot;SQL Joins&quot; include high-fidelity animations.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="font-extrabold text-xs uppercase text-slate-400">Learning Mode</Label>
                                                <Select onValueChange={setMode} value={mode}>
                                                    <SelectTrigger className="rounded-xl border-2 h-11">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="beginner">Beginner Mode (Slower, simple)</SelectItem>
                                                        <SelectItem value="exam_prep">Exam Prep (Quick review, mistakes)</SelectItem>
                                                        <SelectItem value="lab">Lab Mode (Simulations & steps)</SelectItem>
                                                        <SelectItem value="interview">Interview Prep (Deep logic, FAQ)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="font-extrabold text-xs uppercase text-slate-400">AI Avatar Teacher</Label>
                                                <Select onValueChange={setAvatar} value={avatar}>
                                                    <SelectTrigger className="rounded-xl border-2 h-11">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="professor">Professor Sterling</SelectItem>
                                                        <SelectItem value="scientist">Dr. Helen (Scientist)</SelectItem>
                                                        <SelectItem value="expert">Alex (Industry Expert)</SelectItem>
                                                        <SelectItem value="instructor">Marcus (Lab Instructor)</SelectItem>
                                                        <SelectItem value="mentor">Sarah (Friendly Mentor)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="font-extrabold text-xs uppercase text-slate-400">Audio Voice Narration</Label>
                                                <Select onValueChange={setVoice} value={voice}>
                                                    <SelectTrigger className="rounded-xl border-2 h-11">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="male_voice_1">Male Baritone Voice</SelectItem>
                                                        <SelectItem value="female_voice_1">Female Soprano Voice</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="font-extrabold text-xs uppercase text-slate-400">Language</Label>
                                                <Select onValueChange={setLanguage} value={language}>
                                                    <SelectTrigger className="rounded-xl border-2 h-11">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="English">English</SelectItem>
                                                        <SelectItem value="Hindi">Hindi (हिंदी)</SelectItem>
                                                        <SelectItem value="Spanish">Spanish (Español)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit"
                                            className="w-full h-12 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2"
                                        >
                                            <i className="bx bx-sparkles animate-pulse"  />
                                            Compile AI Video Lesson
                                        </Button>
                                    </form>
                                </Card>

                                {/* Side panel: Quick references */}
                                <div className="space-y-6">
                                    <Card className="rounded-3xl border-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 space-y-4">
                                        <h4 className="font-black text-sm uppercase tracking-tight">Active Learning Profile</h4>
                                        {analytics ? (
                                            <div className="space-y-3 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400 font-bold">Preferred Speed:</span>
                                                    <span className="font-extrabold text-indigo-500 uppercase">{analytics.weakTopicsCount > 3 ? "slow" : "normal"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400 font-bold">Lessons Completed:</span>
                                                    <span className="font-extrabold">{analytics.totalLessonsCreated}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400 font-bold">Topic Masteries:</span>
                                                    <span className="font-extrabold text-green-500">{analytics.strongTopicsCount}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No history profile created yet.</p>
                                        )}
                                    </Card>

                                    <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 p-6 space-y-3">
                                        <h4 className="font-black text-sm uppercase tracking-tight">Try Recommended Queries</h4>
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => setTopic("Explain Half Adder")}
                                                className="text-left text-xs font-bold p-3 bg-slate-50 dark:bg-slate-800/20 border rounded-xl hover:border-indigo-400 transition-colors"
                                            >
                                                &quot;Explain Half Adder&quot;
                                            </button>
                                            <button 
                                                onClick={() => setTopic("Teach me Binary Search Tree")}
                                                className="text-left text-xs font-bold p-3 bg-slate-50 dark:bg-slate-800/20 border rounded-xl hover:border-indigo-400 transition-colors"
                                            >
                                                &quot;Teach me Binary Search Tree&quot;
                                            </button>
                                            <button 
                                                onClick={() => setTopic("TCP 3-Way Handshake")}
                                                className="text-left text-xs font-bold p-3 bg-slate-50 dark:bg-slate-800/20 border rounded-xl hover:border-indigo-400 transition-colors"
                                            >
                                                &quot;TCP 3-Way Handshake&quot;
                                            </button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Generated Lessons */}
                        {activeTab === "lessons" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lessons.length > 0 ? (
                                    lessons.map((l) => (
                                        <Card key={l._id} className="rounded-3xl border-2 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-indigo-500/50 transition-colors">
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500">
                                                        {l.mode.replace("_", " ")}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {l.language}
                                                    </span>
                                                </div>

                                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                                    {l.topic}
                                                </h3>

                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                                                    <span>Avatar: {l.avatar}</span>
                                                </div>

                                                {/* Watch progression bar */}
                                                <div className="space-y-1 pt-2">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                        <span>PROGRESS</span>
                                                        <span>{l.completionRate.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500" style={{ width: `${l.completionRate}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <Button 
                                                    onClick={() => router.push(`/video-tutor/lesson/${l._id}`)}
                                                    size="sm" 
                                                    className="rounded-xl font-extrabold uppercase text-[10px] tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black"
                                                >
                                                    <i className="bx bx-play mr-1 fill-current"  /> Watch Lesson
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 text-xs text-slate-400 italic">
                                        No lessons generated yet. Go to the &quot;Ask Professor&quot; tab to get started.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 3: Saved/Bookmarked Lessons */}
                        {activeTab === "saved" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedLessons.length > 0 ? (
                                    savedLessons.map((l) => (
                                        <Card key={l._id} className="rounded-3xl border-2 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-indigo-500/50 transition-colors">
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500">
                                                        {l.mode.replace("_", " ")}
                                                    </span>
                                                    <i className="bx bx-bookmark text-indigo-500 fill-current"  />
                                                </div>

                                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                                    {l.topic}
                                                </h3>

                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                                                    <span>Avatar: {l.avatar}</span>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <Button 
                                                    onClick={() => router.push(`/video-tutor/lesson/${l._id}`)}
                                                    size="sm" 
                                                    className="rounded-xl font-extrabold uppercase text-[10px] tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black"
                                                >
                                                    <i className="bx bx-play mr-1 fill-current"  /> Watch Lesson
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 text-xs text-slate-400 italic">
                                        No saved lessons found. Click bookmark inside any playing lesson to save it here.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 4: History Logs */}
                        {activeTab === "history" && (
                            <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
                                <div className="border-b pb-4 mb-6 border-slate-100 dark:border-slate-800">
                                    <h3 className="font-black text-lg uppercase tracking-tight">Recent Activity History</h3>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Logs of active video interactions</p>
                                </div>

                                {watchHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {watchHistory.map((h, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-semibold">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                                        <i className="bx bx-video"  />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{h.topic}</h4>
                                                        <span className="text-[10px] text-slate-400">Mode: {h.mode} | Avatar: {h.avatar}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-slate-400 font-bold block">
                                                        {new Date(h.watchedAt).toLocaleDateString()}
                                                    </span>
                                                    <button 
                                                        onClick={() => router.push(`/video-tutor/lesson/${h.lessonId}`)}
                                                        className="text-[10px] text-indigo-500 hover:underline font-extrabold uppercase mt-0.5"
                                                    >
                                                        Watch Again &gt;
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic text-center py-10">No watched sessions found.</p>
                                )}
                            </Card>
                        )}

                        {/* Tab 5: Tutor Analytics */}
                        {activeTab === "analytics" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left column: Scores radar chart */}
                                <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
                                    <div className="border-b pb-4 mb-6 border-slate-100 dark:border-slate-800">
                                        <h3 className="font-black text-lg uppercase tracking-tight">AI Skill Mapping</h3>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Radar tracking of target learning quotients</p>
                                    </div>

                                    <div className="h-[250px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="#334155" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b" }} />
                                                <Radar name="Student" dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.3} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Right columns: Detail aggregates */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 p-6 text-center space-y-2">
                                            <i className="bx bx-flame w-8 h-8 text-orange-500 mx-auto animate-pulse"  />
                                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Active Streak</h4>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {analytics ? analytics.learningStreakDays : 3} Days
                                            </p>
                                        </Card>
                                        <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 p-6 text-center space-y-2">
                                            <i className="bx bx-cpu w-8 h-8 text-indigo-500 mx-auto"  />
                                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Mastery Ratio</h4>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {analytics ? analytics.strongTopicsCount : 2} / {analytics ? (analytics.strongTopicsCount + analytics.weakTopicsCount) : 4}
                                            </p>
                                        </Card>
                                        <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 p-6 text-center space-y-2">
                                            <i className="bx bx-bookopen w-8 h-8 text-emerald-500 mx-auto"  />
                                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Watch Time</h4>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {analytics ? (analytics.watchTimeSeconds / 60).toFixed(1) : "12.5"} Min
                                            </p>
                                        </Card>
                                    </div>

                                    {/* Topic strength metrics */}
                                    <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 p-6 md:p-8">
                                        <h4 className="font-black text-sm uppercase tracking-tight mb-4">Topic Mastery Breakdown</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <span className="text-[10px] font-black uppercase text-green-500 tracking-wider flex items-center gap-1.5">
                                                    <i className="bx bx-check-circle"  /> Confirmed Strengths
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {analytics && analytics.strongTopics.length > 0 ? (
                                                        analytics.strongTopics.map((t: string, idx: number) => (
                                                            <span key={idx} className="bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/30 px-3 py-1.5 rounded-xl text-xs font-bold">
                                                                {t}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No masteries logged. Pass lesson quizzes to build mastery.</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <span className="text-[10px] font-black uppercase text-red-500 tracking-wider flex items-center gap-1.5">
                                                    <i className="bx bx-xcircle"  /> Focus Required (Weak Areas)
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {analytics && analytics.weakTopics.length > 0 ? (
                                                        analytics.weakTopics.map((t: string, idx: number) => (
                                                            <span key={idx} className="bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/30 px-3 py-1.5 rounded-xl text-xs font-bold">
                                                                {t}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No weak areas identified. Perfect alignment!</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </VideoTutorLayout>
    );
}

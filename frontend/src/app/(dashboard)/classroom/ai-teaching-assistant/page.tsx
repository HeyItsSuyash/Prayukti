"use client";

import React, { useState, useEffect } from "react";
import ClassroomLayout from "@/components/classroom/ClassroomLayout";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import ReactMarkdown from "react-markdown";

export default function AiTeachingAssistantPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSub, setSelectedSub] = useState("");
    const [loading, setLoading] = useState(true);

    // Active AI Generator State
    const [tool, setTool] = useState<"lesson" | "assignment" | "labsheet" | "ppt" | "qbank">("lesson");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [experimentName, setExperimentName] = useState("");
    const [genResult, setGenResult] = useState("");
    const [genLoading, setGenLoading] = useState(false);

    // Diagnostics Stats
    const [perfSummary, setPerfSummary] = useState<any>(null);
    const [diffAnalysis, setDiffAnalysis] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(false);

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

    // Load reports when subject changes
    useEffect(() => {
        if (!selectedSub) return;
        
        const fetchDiagnostics = async () => {
            setStatsLoading(true);
            try {
                const token = localStorage.getItem("token") || "";
                
                // Class summary
                const sumRes = await fetch(`${API_URL}/api/ai-teacher/class-summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (sumRes.ok) {
                    setPerfSummary(await sumRes.json());
                }

                // Difficulty analytics
                const diffRes = await fetch(`${API_URL}/api/ai-teacher/topic-difficulty/${selectedSub}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (diffRes.ok) {
                    const data = await diffRes.json();
                    setDiffAnalysis(data.difficultyAnalysis);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchDiagnostics();
    }, [selectedSub]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSub) return;

        setGenLoading(true);
        setGenResult("");

        try {
            const token = localStorage.getItem("token") || "";
            let endpoint = "";
            let body: any = { subject_id: selectedSub };

            if (tool === "lesson") {
                endpoint = "/lesson-plan";
                body.topic = topic || "Introduction to course principles";
            } else if (tool === "assignment") {
                endpoint = "/assignments";
                body.topic = topic || "Practical Review Tasks";
                body.difficulty = difficulty;
            } else if (tool === "labsheet") {
                endpoint = "/lab-sheets";
                body.experiment_name = experimentName || "Custom Simulation Procedure";
            } else if (tool === "ppt") {
                endpoint = "/ppt-outlines";
                body.topic = topic || "Theoretical Slides Deck";
            } else {
                endpoint = "/question-banks";
                body.topic = topic || "Exam Review Prep";
            }

            const res = await fetch(`${API_URL}/api/ai-teacher${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("AI generation cycle failed");
            const data = await res.json();

            if (tool === "lesson") setGenResult(data.lessonPlan);
            else if (tool === "assignment") setGenResult(data.assignmentText);
            else if (tool === "labsheet") setGenResult(data.labSheet);
            else if (tool === "ppt") setGenResult(data.pptOutline);
            else setGenResult(data.questionBank);

        } catch (err: any) {
            setGenResult(`Error: ${err.message}. Verify that you have the correct network permissions.`);
        } finally {
            setGenLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(genResult);
        alert("Copied successfully to clipboard!");
    };

    return (
        <ClassroomLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            AI Teaching <span className="text-indigo-600 dark:text-indigo-400 italic">Assistant</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
                            Automate syllabus documentation, generate lab sheets, PPT Outlines, and diagnose class learning gaps.
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

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <i className="bx bx-loader2 w-10 h-10 text-indigo-600 animate-spin mb-4"  />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Binding copilot engine...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Column 1: Generator Tool parameters */}
                        <div className="space-y-6 lg:col-span-1">
                            <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
                                <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                                    <i className="bx bx-bot text-indigo-600 dark:text-indigo-400"  />
                                    <h3 className="font-black text-sm uppercase tracking-tight">AI Materials Generator</h3>
                                </div>

                                <div className="space-y-1">
                                    <Label className="font-bold text-xs uppercase text-slate-400">Select Tool</Label>
                                    <Select onValueChange={(val: any) => setTool(val)} value={tool}>
                                        <SelectTrigger className="rounded-xl border-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="lesson">Lesson Planner</SelectItem>
                                            <SelectItem value="assignment">Assignment / Quiz Maker</SelectItem>
                                            <SelectItem value="labsheet">Virtual Lab Sheet Maker</SelectItem>
                                            <SelectItem value="ppt">Presentation Outline</SelectItem>
                                            <SelectItem value="qbank">Question Bank Compiler</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <form onSubmit={handleGenerate} className="space-y-4 pt-2">
                                    {tool !== "labsheet" ? (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="topic" className="font-bold text-xs uppercase text-slate-400">Lecture Topic / Focus Area</Label>
                                            <Input 
                                                id="topic"
                                                placeholder="E.g., Socket Programming in C++"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="rounded-xl border-2"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="exp" className="font-bold text-xs uppercase text-slate-400">Virtual Experiment Target</Label>
                                            <Input 
                                                id="exp"
                                                placeholder="E.g., Implementation of Hamming Error Correction"
                                                value={experimentName}
                                                onChange={(e) => setExperimentName(e.target.value)}
                                                className="rounded-xl border-2"
                                                required
                                            />
                                        </div>
                                    )}

                                    {tool === "assignment" && (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="difficulty" className="font-bold text-xs uppercase text-slate-400">Target Difficulty</Label>
                                            <Select onValueChange={setDifficulty} value={difficulty}>
                                                <SelectTrigger className="rounded-xl border-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="Easy">Easy (Conceptual foundations)</SelectItem>
                                                    <SelectItem value="Medium">Medium (Logical implementation)</SelectItem>
                                                    <SelectItem value="Hard">Hard (Edge case optimization)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <Button 
                                        type="submit" 
                                        disabled={genLoading}
                                        className="w-full h-11 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-black font-black uppercase tracking-widest text-[9px]"
                                    >
                                        {genLoading ? <i className="bx bx-loader2 w-4 h-4 animate-spin mx-auto"  /> : "Run AI Compile"}
                                    </Button>
                                </form>
                            </Card>

                            {/* Class Summary Stats Panel */}
                            {perfSummary && (
                                <Card className="rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                                        <i className="bx bx-barchart3 text-emerald-500"  />
                                        <h3 className="font-black text-sm uppercase tracking-tight">Class diagnostics</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-400">Average Engagement:</span>
                                            <span className="text-emerald-600">{perfSummary.classAverageEngagement}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-400">At-Risk Alerts:</span>
                                            <span className="text-red-500">{perfSummary.atRiskStudentsCount}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed border-t pt-3 border-slate-100 dark:border-slate-800">
                                            {perfSummary.performanceSummary}
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Column 2: Generator output results & Topic Difficulty Analysis */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* AI Output Window */}
                            {genResult && (
                                <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 animate-in slide-in-from-right duration-300">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Output Stream</span>
                                            <h3 className="font-black text-lg uppercase tracking-tight">Generated Materials</h3>
                                        </div>
                                        <Button size="sm" onClick={handleCopy} variant="outline" className="h-9 rounded-xl font-bold text-xs">
                                            <i className="bx bx-copy mr-1.5"  /> Copy Outline
                                        </Button>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-3xl markdown-content prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                        <ReactMarkdown>
                                            {genResult}
                                        </ReactMarkdown>
                                    </div>
                                </Card>
                            )}

                            {/* Topic Difficulty Diagnostic table */}
                            <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-black text-lg uppercase tracking-tight">Lab Difficulty <span className="text-indigo-600 dark:text-indigo-400 italic">Hotspots</span></h3>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Aggregates compile tries and failure rates per lab module</p>
                                    </div>
                                </div>
                                <CardContent className="p-0">
                                    {statsLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                                            <i className="bx bx-loader2 w-6 h-6 text-indigo-600 animate-spin mb-2"  />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Analyzing failed attempts...</p>
                                        </div>
                                    ) : diffAnalysis.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                        <th className="px-6 py-4">Lab Module / Topic</th>
                                                        <th className="px-6 py-4">Avg compiler runs</th>
                                                        <th className="px-6 py-4">Success Failure rate</th>
                                                        <th className="px-6 py-4">Difficulty classification</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {diffAnalysis.map((item, idx) => (
                                                        <tr key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">{item.experimentName}</td>
                                                            <td className="px-6 py-4">{item.averageAttempts} runs</td>
                                                            <td className="px-6 py-4 text-red-500">{item.failureRatePercent} failures</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${
                                                                    item.difficultyRating.includes("Hard") 
                                                                        ? "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-100 dark:border-red-900/30"
                                                                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500"
                                                                }`}>
                                                                    {item.difficultyRating}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic p-6 text-center">No lab metrics found for this subject.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </ClassroomLayout>
    );
}

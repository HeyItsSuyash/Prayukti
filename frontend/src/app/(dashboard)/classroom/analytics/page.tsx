"use client";

import React, { useState, useEffect } from "react";
import ClassroomLayout from "@/components/classroom/ClassroomLayout";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    BarChart3, 
    Calendar, 
    Activity, 
    TrendingUp, 
    BookOpen, 
    UserCheck,
    Loader2
} from "lucide-react";

export default function AnalyticsPage() {
    const [user, setUser] = useState<any>(null);
    const [studentData, setStudentData] = useState<any>(null);
    const [teacherData, setTeacherData] = useState<any>(null);
    const [adminData, setAdminData] = useState<any>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSub, setSelectedSub] = useState("");
    
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('vlab_token');
                const parsedUser = JSON.parse(storedUser || "{}");
                const role = parsedUser.role?.toLowerCase();

                // Fetch subjects
                const sRes = await fetch(`${API_URL}/api/subjects`);
                let firstSubId = "";
                if (sRes.ok) {
                    const sData = await sRes.json();
                    setSubjects(sData);
                    if (sData.length > 0) {
                        firstSubId = sData[0]._id;
                        setSelectedSub(firstSubId);
                    }
                }

                if (role === "student") {
                    const stRes = await fetch(`${API_URL}/api/classroom-analytics/student`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (stRes.ok) {
                        setStudentData(await stRes.json());
                    }
                } else if (role === "teacher") {
                    if (firstSubId) {
                        const tRes = await fetch(`${API_URL}/api/classroom-analytics/teacher?subject_id=${firstSubId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (tRes.ok) {
                            setTeacherData(await tRes.json());
                        }
                    }
                } else if (role === "admin") {
                    const adRes = await fetch(`${API_URL}/api/classroom-analytics/institution`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (adRes.ok) {
                        setAdminData(await adRes.json());
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch teacher stats when subject changes
    const handleSubjectChange = async (val: string) => {
        setSelectedSub(val);
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('vlab_token');
            const tRes = await fetch(`${API_URL}/api/classroom-analytics/teacher?subject_id=${val}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (tRes.ok) {
                setTeacherData(await tRes.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    };

    const isTeacher = user?.role?.toLowerCase() === "teacher";
    const isAdmin = user?.role?.toLowerCase() === "admin";
    const isStudent = user?.role?.toLowerCase() === "student" || (!isTeacher && !isAdmin);

    return (
        <ClassroomLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Classroom <span className="text-indigo-600 dark:text-indigo-400 italic">Analytics</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
                            Consolidated tracking metrics. Evaluate class join counts, score progress timelines, and department metrics.
                        </p>
                    </div>

                    {isTeacher && (
                        <div className="flex items-center gap-2">
                            <Label className="font-bold text-xs uppercase text-slate-400 shrink-0">Select Subject:</Label>
                            <Select onValueChange={handleSubjectChange} value={selectedSub}>
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
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Calculating performance vectors...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* 1. Student Analytics Panel */}
                        {isStudent && studentData && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left column: Progress info */}
                                <div className="space-y-6 lg:col-span-1">
                                    <Card className="rounded-[2rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 text-center">
                                        <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <BookOpen size={30} />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Learning Progress</h3>
                                        <p className="text-xs text-slate-400 font-semibold mb-6">Completed virtual experiments rating</p>
                                        
                                        <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                                            {/* Premium SVG progress loop */}
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-slate-100 dark:text-slate-800"
                                                    strokeWidth="3.5"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className="text-indigo-600 dark:text-indigo-400"
                                                    strokeDasharray={`${studentData.learningProgress.completionRate.toFixed(0)}, 100`}
                                                    strokeWidth="3.5"
                                                    strokeLinecap="round"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <span className="absolute text-xl font-black">{studentData.learningProgress.completionRate.toFixed(0)}%</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                            Attempted {studentData.learningProgress.completed} of {studentData.learningProgress.total} modules
                                        </p>
                                    </Card>

                                    <Card className="rounded-[2rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6">
                                        <div className="flex items-center gap-2 border-b pb-3 mb-4 border-slate-100 dark:border-slate-800">
                                            <Activity className="text-emerald-500" size={16} />
                                            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Engagement Trend</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                <span className="text-[10px] font-black text-slate-400 block uppercase">Daily Interaction Index</span>
                                                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{studentData.engagement.daily[0]?.score || 70} / 100</span>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                <span className="text-[10px] font-black text-slate-400 block uppercase">Weekly Average Index</span>
                                                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{studentData.engagement.weekly[0]?.score || 75} / 100</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right columns: Attendance Log history list */}
                                <div className="lg:col-span-2">
                                    <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm overflow-hidden h-full">
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-black text-lg uppercase tracking-tight">Classroom Join <span className="text-indigo-600 dark:text-indigo-400 italic">Logs</span></h3>
                                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Live scheduled class attendance history logs</p>
                                            </div>
                                            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                                <Calendar size={18} />
                                            </div>
                                        </div>
                                        <CardContent className="p-0 max-h-[450px] overflow-y-auto">
                                            {studentData.attendance.length > 0 ? (
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                            <th className="px-6 py-4">Session Date</th>
                                                            <th className="px-6 py-4">Marking status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {studentData.attendance.map((log: any, idx: number) => (
                                                            <tr key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                <td className="px-6 py-4">{log.date}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                                                        log.status === "present"
                                                                            ? "bg-green-50 dark:bg-green-950/20 text-green-600 border border-green-100 dark:border-green-900/30"
                                                                            : "bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-900/30"
                                                                    }`}>
                                                                        {log.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-8 text-center text-xs text-slate-400 italic">No attendance records documented. Make sure to join classes scheduled by teachers.</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* 2. Teacher Analytics Panel */}
                        {isTeacher && teacherData && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">
                                            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Class Participation indices</h3>
                                            <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={18} />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Average Batch Engagement</span>
                                                <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{teacherData.averageEngagement.toFixed(1)}%</h2>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Total Enrolled Class size</span>
                                                <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">{teacherData.totalStudents} Students</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-4">Participation score calculations compile logs of assignments, chatbot activity, and session joins.</p>
                                </Card>

                                <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
                                    <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">
                                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Assignment effectiveness</h3>
                                        <UserCheck className="text-emerald-500" size={18} />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-slate-100 dark:text-slate-800"
                                                    strokeWidth="3.5"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className="text-emerald-500"
                                                    strokeDasharray={`${((teacherData.assignmentsSubmitted / teacherData.expectedSubmissions) * 100).toFixed(0)}, 100`}
                                                    strokeWidth="3.5"
                                                    strokeLinecap="round"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <span className="absolute text-xl font-black">{((teacherData.assignmentsSubmitted / teacherData.expectedSubmissions) * 100).toFixed(0)}%</span>
                                        </div>
                                        <p className="text-xs font-bold text-center text-slate-500 dark:text-slate-400">
                                            Received {teacherData.assignmentsSubmitted} submissions of {teacherData.expectedSubmissions} expected homework sheets
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* 3. Institution Analytics Panel (Admin) */}
                        {isAdmin && adminData && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
                                    <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">
                                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Department performance averages</h3>
                                        <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={18} />
                                    </div>
                                    <div className="space-y-4">
                                        {adminData.departmentPerformance?.map((dept: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold">
                                                <span className="text-slate-800 dark:text-slate-200">{dept.department}</span>
                                                <span className="text-indigo-600 dark:text-indigo-400">{dept.averageEngagement.toFixed(1)}% index</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
                                    <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">
                                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Faculty effectiveness indexes</h3>
                                        <UserCheck className="text-emerald-500" size={18} />
                                    </div>
                                    <div className="space-y-4">
                                        {adminData.facultyEffectiveness?.map((fac: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold">
                                                <span className="text-slate-800 dark:text-slate-200">{fac.facultyName}</span>
                                                <span className="text-emerald-600">{fac.effectivenessScore} points</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </ClassroomLayout>
    );
}

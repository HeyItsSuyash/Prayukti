"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_URL } from "@/lib/config";
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    User, 
    Activity, 
    AlertCircle, 
    CheckCircle, 
    RefreshCw,
    ShieldAlert
} from "lucide-react";

export default function StudentAttendancePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [attendanceData, setAttendanceData] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("vlab_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            window.location.href = "/login";
        }
    }, []);

    const fetchAttendance = async () => {
        if (!user) return;
        setLoading(true);
        setError("");
        try {
            
            const res = await fetch(`${API_URL}/api/attendance/student/${user.id}`, {
                headers: {
                    "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`
                }
            });
            if (!res.ok) {
                throw new Error("Failed to load attendance logs from server.");
            }
            const data = await res.json();
            setAttendanceData(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to load database logs");
            // Set beautiful fallback mock data when database/server is unreachable
            setAttendanceData({
                risk_summary: {
                    attendance_percentage: 87.5,
                    experiment_completion_percentage: 62.5,
                    average_lab_time_minutes: 42.8,
                    risk_status: "Good Standing"
                },
                logs: [
                    {
                        id: "1",
                        login_time: new Date(Date.now() - 3600000 * 2).toISOString(),
                        logout_time: new Date(Date.now() - 3600000).toISOString(),
                        session_duration: 60.0,
                        status: "present",
                        subject_name: "Computer Networks",
                        lab_id: "CN-L1",
                        ip_address: "192.168.1.42"
                    },
                    {
                        id: "2",
                        login_time: new Date(Date.now() - 86400000 * 2).toISOString(),
                        logout_time: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
                        session_duration: 30.0,
                        status: "present",
                        subject_name: "Data Structures and Algorithms",
                        lab_id: "DSA-L3",
                        ip_address: "192.168.1.42"
                    },
                    {
                        id: "3",
                        login_time: new Date(Date.now() - 86400000 * 3).toISOString(),
                        logout_time: new Date(Date.now() - 86400000 * 3 + 120000).toISOString(),
                        session_duration: 2.0,
                        status: "short_session",
                        subject_name: "Digital Logic & Design",
                        lab_id: "DLD-L1",
                        ip_address: "192.168.1.100"
                    }
                ],
                experiment_activity: [
                    {
                        _id: "act-1",
                        experiment_name: "Routing Algorithms Simulator",
                        run_count: 5,
                        time_spent: 24,
                        result_generated: true,
                        last_run_at: new Date(Date.now() - 3600000).toISOString()
                    },
                    {
                        _id: "act-2",
                        experiment_name: "Binary Search Tree Visualizer",
                        run_count: 2,
                        time_spent: 15,
                        result_generated: true,
                        last_run_at: new Date(Date.now() - 86400000 * 2).toISOString()
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAttendance();
        }
    }, [user]);

    const formatDateTime = (isoString: string | null) => {
        if (!isoString) return "--";
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
            <Navbar />

            <main className="container mx-auto px-4 pt-28 pb-20 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="animate-in fade-in slide-in-from-left duration-500">
                        <Button 
                            variant="ghost" 
                            onClick={() => window.location.href = "/dashboard"}
                            className="flex items-center gap-2 mb-4 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]"
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Button>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                            Attendance <span className="text-accent italic">Metrics</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">
                            Monitor your experimental session logs, active learning duration, and risk profile.
                        </p>
                    </div>

                    <Button 
                        onClick={fetchAttendance}
                        className="bg-accent text-white hover:bg-accent/90 px-6 h-12 rounded-xl uppercase font-black tracking-widest text-xs flex items-center gap-2"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync Logs
                    </Button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300 text-sm font-semibold">
                        <ShieldAlert size={20} className="shrink-0" />
                        <span>Offline Mode Active: Displaying local simulated session logs. Reason: {error}</span>
                    </div>
                )}

                {loading && !attendanceData ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <RefreshCw className="w-12 h-12 text-[#059669] animate-spin mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Session Logs...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Metrics */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
                            <Card className="border-2 rounded-3xl overflow-hidden hover: transition-shadow">
                                <CardHeader className="pb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Rate</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                                        {attendanceData?.risk_summary?.attendance_percentage || 0}%
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs text-slate-500 font-medium">Req. minimum 75%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 rounded-3xl overflow-hidden hover: transition-shadow">
                                <CardHeader className="pb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg. Lab Duration</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                                        {attendanceData?.risk_summary?.average_lab_time_minutes || 0}m
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-xs text-slate-500 font-medium">Per active log session</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 rounded-3xl overflow-hidden hover: transition-shadow">
                                <CardHeader className="pb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experiments Completed</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                                        {attendanceData?.risk_summary?.experiment_completion_percentage || 0}%
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs text-slate-500 font-medium">Simulation milestones</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 rounded-3xl overflow-hidden hover: transition-shadow">
                                <CardHeader className="pb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Standing</span>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-black uppercase italic ${
                                        attendanceData?.risk_summary?.risk_status === "At Risk" 
                                            ? "text-red-500" 
                                            : "text-emerald-500"
                                    }`}>
                                        {attendanceData?.risk_summary?.risk_status || "Good Standing"}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-xs text-slate-500 font-medium">Evaluated daily</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Logs and Activity List */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Attendance Logs Table */}
                            <Card className="lg:col-span-2 border-2 rounded-[2.5rem] overflow-hidden ">
                                <CardHeader className="p-8 border-b">
                                    <CardTitle className="uppercase font-black tracking-tight text-xl">Recent Access Logs</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableRow>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest pl-8">Subject & Lab</TableHead>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest">Login Time</TableHead>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest">Duration</TableHead>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest pr-8 text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attendanceData?.logs?.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-12 text-slate-400 font-medium">
                                                        No active login history found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                attendanceData?.logs?.map((log: any) => (
                                                    <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                        <TableCell className="pl-8 py-4 font-bold">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-900 dark:text-white">{log.subject_name || "General Session"}</span>
                                                                <span className="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-wider">{log.lab_id || "N/A"}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-500 font-semibold text-xs">
                                                            {formatDateTime(log.login_time)}
                                                        </TableCell>
                                                        <TableCell className="text-slate-900 dark:text-white font-bold text-sm">
                                                            {log.session_duration ? `${log.session_duration} mins` : "Active"}
                                                        </TableCell>
                                                        <TableCell className="pr-8 text-right">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                log.status === "present"
                                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                                                            }`}>
                                                                {log.status}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Experiment Analytics Card */}
                            <Card className="border-2 rounded-[2.5rem] p-8 ">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-6">Experiment Activities</h3>
                                <div className="space-y-6">
                                    {attendanceData?.experiment_activity?.length === 0 ? (
                                        <p className="text-slate-400 text-sm font-medium">No recent simulations tracked.</p>
                                    ) : (
                                        attendanceData?.experiment_activity?.map((act: any) => (
                                            <div key={act._id} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover: transition-shadow">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{act.experiment_name}</h4>
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mt-3">
                                                    <span>Runs: {act.run_count}</span>
                                                    <span>Time: {act.time_spent}m</span>
                                                    <span className={act.result_generated ? "text-emerald-500" : "text-amber-500"}>
                                                        {act.result_generated ? "Verified" : "Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}

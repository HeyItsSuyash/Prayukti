"use client";

import { API_URL } from "@/lib/config";

import { useEffect, useState } from "react";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PremiumNavbar } from "@/components/layout/PremiumNavbar";
import { PremiumFooter } from "@/components/layout/PremiumFooter";
import { RoleGuard } from "@/lib/auth/withRole";

interface Subject {
    _id: string;
    title: string;
    description: string;
    icon: string;
    slug: string;
}

export function StudentDashboard() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);
    

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchSubjects = async () => {
            try {
                const res = await fetch(`${API_URL}/api/subjects`);
                if (!res.ok) throw new Error("Failed to synchronize simulation modules");
                const data = await res.json();
                setSubjects(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('vlab_token');
            if (token) {
                await fetch(`${API_URL}/api/attendance/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (err) {
            console.error('[LOGOUT] attendance API failed:', err);
        } finally {
            localStorage.removeItem('vlab_token');
            localStorage.removeItem('vlab_user');
            window.location.href = ('/login');
        }
    };

    const getSubjectImage = (icon: string, title: string) => {
        const lowerTitle = title.toLowerCase();
        if (icon === "cn" || lowerTitle.includes("network")) return "/cn-module.jpg.jpg";
        if (icon === "dbms" || lowerTitle.includes("database")) return "/dbms-module.jpg.jpg";
        if (icon === "dld" || lowerTitle.includes("digital logic")) return "/dld-module.jpg.jpg";
        if (icon === "oops" || lowerTitle.includes("object oriented")) return "/oops-module.jpg.jpg";
        // Fallback for DSA and others since we don't have images for them right now
        return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80";
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans transition-colors duration-500">
            <PremiumNavbar pathname="/dashboard" />

            <main className="container mx-auto px-4 pt-28 pb-20 max-w-7xl">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="animate-in fade-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#14D98F] animate-pulse shadow-[0_0_8px_rgba(20,217,143,0.6)]" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Session Active</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#021D24] leading-none flex flex-wrap items-center gap-3">
                            My <span className="text-[#059669]">Dashboard</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-medium mt-4 max-w-xl">
                            {user ? `Welcome back, ${user.fullName.split(' ')[0]}. ` : ""}
                            Select a virtual laboratory module to begin your experimental session.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700">
                        <RoleGuard allowedRoles={["ADMIN"]}>
                            <a href="/admin/lab-designer">
                                <Button className="h-12 px-6 font-semibold bg-[#059669] hover:bg-[#047857] text-white rounded-xl shadow-sm transition-transform active:scale-95">
                                    + Create New Lab
                                </Button>
                            </a>
                        </RoleGuard>
                    </div>
                </div>

                {/* Subjects Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                        <i className="bx bx-loader-alt bx-spin text-4xl text-primary mb-4" />
                        <p className="text-muted-foreground font-semibold text-sm">Synchronizing Modules...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-destructive/5 rounded-md border border-destructive/20 text-center px-6 max-w-2xl mx-auto shadow-sm">
                        <i className="bx bx-error-circle text-5xl text-destructive mb-4" />
                        <h2 className="text-xl font-bold text-destructive">Connection Refused</h2>
                        <p className="text-destructive/80 max-w-md mx-auto mt-2 font-medium text-base leading-relaxed">
                            {error}
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="mt-6 bg-primary text-primary-foreground px-8 h-11 rounded-sm font-semibold text-sm"
                        >
                            Reconnect with Core
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {subjects.map((sub, idx) => (
                            <a key={sub._id} href={`/dashboard/${sub.slug || sub._id}`} className="block group">
                                <Card
                                    className="h-full transition-all duration-300 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-[#059669]/30"
                                >
                                    <CardContent className="p-0">
                                        <div className="w-full h-48 bg-slate-100 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                                            <img src={getSubjectImage(sub.icon, sub.title)} alt={sub.title} className="w-full h-full object-cover" />
                                        </div>
                                        
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold tracking-tight leading-tight mb-3 text-[#021D24] group-hover:text-[#059669] transition-colors">
                                            {sub.title}
                                        </h3>

                                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3">
                                            {sub.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#14D98F] animate-pulse" />
                                                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                                                    Active Lab
                                                </span>
                                            </div>
                                            <i className="bx bx-right-arrow-alt text-xl transition-transform group-hover:translate-x-1 text-slate-400 group-hover:text-[#059669]" />
                                        </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </a>
                        ))}
                    </div>
                )}

                {/* Status and Exams Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
                    {/* System Status */}
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:shadow-md">
                        <div className="w-14 h-14 bg-[#059669]/10 rounded-full flex items-center justify-center mb-5 text-[#059669]">
                            <i className="bx bx-pulse text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2 text-[#021D24]">
                            System Status
                            <span className="ml-3 inline-flex items-center rounded-full bg-[#059669]/10 px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                                Coming Soon
                            </span>
                        </h3>
                        <p className="text-slate-500 font-medium max-w-sm leading-relaxed mb-6">
                            Simulation clusters are fully operational. Optimal performance detected across all node regions.
                        </p>
                        <div className="w-full pt-6 border-t border-slate-100">
                            <span className="text-sm font-semibold text-slate-400 flex items-center justify-center gap-1.5 cursor-not-allowed">
                                View Detailed Attendance Log <i className="bx bx-right-arrow-alt" />
                            </span>
                        </div>
                    </div>

                    {/* Role Specific Actions (Exams) */}
                    <div className="space-y-6">

                        {/* Student Specific: Practical Exams */}
                        <RoleGuard allowedRoles={["STUDENT"]}>
                            <div className="border border-[#059669]/20 rounded-2xl p-8 bg-[#059669]/5 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
                                <div className="relative z-10">
                                    <div className="mb-5 text-[#059669]">
                                        <i className="bx bx-book-open text-3xl" />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight mb-2 text-[#021D24]">
                                        Practical Exams
                                        <span className="ml-3 inline-flex items-center rounded-full bg-[#059669]/10 px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                                            Coming Soon
                                        </span>
                                    </h3>
                                    <p className="text-[#021D24]/70 font-medium mb-6 leading-relaxed max-w-sm">
                                        Check for active or upcoming timed examinations assigned to your batch.
                                    </p>
                                    <Button disabled className="h-11 px-6 font-semibold bg-[#059669]/30 text-white rounded-xl text-sm cursor-not-allowed">
                                        Enter Exam Portal
                                    </Button>
                                </div>
                            </div>
                        </RoleGuard>

                        {/* Teacher/Admin Specific: Academic Insights */}
                        <RoleGuard allowedRoles={["TEACHER", "ADMIN"]}>
                            <div className="bg-white rounded-2xl p-8 relative overflow-hidden group shadow-sm border border-slate-200 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight mb-2 text-[#021D24]">Academic Insights</h3>
                                        <p className="text-slate-500 font-medium mb-6 leading-relaxed max-w-sm">
                                            Administer exams, monitor live results, and manage simulation modules from this dedicated dashboard.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <a href="/dashboard/teacher/exams">
                                            <Button className="h-11 px-6 font-semibold bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-sm shadow-sm transition-transform active:scale-95">
                                                Manage Exams
                                            </Button>
                                        </a>
                                        <a href="/teacher/analytics">
                                            <Button variant="outline" className="h-11 px-6 font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm">
                                                View Analytics
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </RoleGuard>
                    </div>
                </div>
            </main>

            <PremiumFooter />
        </div>
    );
}

"use client";

import { API_URL } from "@/lib/config";

import { useEffect, useState, useRef } from "react";


import { Button } from "@/components/ui/button";
import { PremiumNavbar } from "@/components/layout/PremiumNavbar";
import { PremiumFooter } from "@/components/layout/PremiumFooter";
import { RoleGuard } from "@/lib/auth/withRole";
import { LabCard } from "@/components/ui/LabCard";

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
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
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
            const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
            if (token) {
                await fetch(`${API_URL}/api/attendance/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (err) {
            console.error('[LOGOUT] attendance API failed:', err);
        } finally {
            
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
        return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80";
    };

    const isComingSoon = (title: string, iconStr: string) => {
        const lowerTitle = title.toLowerCase();
        const i = iconStr?.toLowerCase();
        if (
            i === "cn" || lowerTitle.includes("network") ||
            i === "dbms" || lowerTitle.includes("database") ||
            i === "dld" || lowerTitle.includes("digital logic")
        ) {
            return false;
        }
        return true;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
            <PremiumNavbar pathname="/dashboard" />

            <main className="container mx-auto px-4 pt-28 pb-20 max-w-7xl">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="animate-in slide-in-from-left ">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#021D24] dark:text-white leading-none flex flex-wrap items-center gap-3">
                            My <span className="text-[#059669]">Dashboard</span>
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-xl">
                            {user ? `Welcome back, ${user.fullName.split(' ')[0]}. ` : ""}
                            Select a virtual laboratory module to begin your experimental session.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 fade-in slide-in-from-right ">
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
                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-foreground">Suggested Courses</h3>
                        </div>
                        
                        <div 
                            ref={scrollRef}
                            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {subjects.slice(0, 5).map((sub, idx) => {
                                const comingSoon = isComingSoon(sub.title, sub.icon);
                                return (
                                    <div key={sub._id} className="w-[300px] md:w-[350px] flex-shrink-0 snap-start">
                                        <LabCard
                                            id={sub._id}
                                            slug={sub.slug}
                                            title={sub.title}
                                            description={sub.description}
                                            imageSrc={getSubjectImage(sub.icon, sub.title)}
                                            comingSoon={comingSoon}
                                        />
                                    </div>
                                );
                            })}
                            
                            <div className="w-[300px] md:w-[350px] flex-shrink-0 snap-start flex items-stretch">
                                <a href="/labs" className="w-full">
                                    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#021D24] to-[#059669] rounded-2xl p-8 text-center min-h-[300px] shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1">
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            <i className="bx bx-rocket text-8xl text-white" />
                                        </div>
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="w-16 h-16 bg-white/10 rounded-md flex items-center justify-center mb-4 group-hover:translate-x-2 transition-transform">
                                                <i className="bx bx-right-arrow-alt text-4xl text-white"></i>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">View All Labs</h3>
                                            <p className="text-white/80 text-sm font-medium">Explore our complete catalog of virtual laboratories.</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        
                        <div className="flex justify-center gap-4 mt-2">
                            <Button variant="outline" size="icon" onClick={() => scroll('left')} className="h-10 w-10 rounded-md border-border hover:bg-muted">
                                <i className="bx bx-chevron-left text-xl"></i>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => scroll('right')} className="h-10 w-10 rounded-md border-border hover:bg-muted">
                                <i className="bx bx-chevron-right text-xl"></i>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Coming Soon Features Banner */}
                <div className="mt-16 bg-gradient-to-br from-[#021D24] to-[#059669] rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <i className="bx bx-rocket text-9xl text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-white">
                            More features to be added soon in the dashboard.
                        </h3>
                        <p className="text-white/80 font-medium max-w-xl mx-auto leading-relaxed">
                            We are constantly working to improve your learning experience. Stay tuned for advanced analytics, practical exams, and more interactive modules.
                        </p>
                    </div>
                </div>
            </main>

            <PremiumFooter />
        </div>
    );
}

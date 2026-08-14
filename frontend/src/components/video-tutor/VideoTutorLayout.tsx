"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

interface VideoTutorLayoutProps {
    children: React.ReactNode;
}

export default function VideoTutorLayout({ children }: VideoTutorLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    const sidebarItems = [
        {
            name: "Tutor Hub",
            path: "/video-tutor",
            icon: LayoutDashboard,
        }
    ];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-t-[#059669] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
            <Navbar pathname={pathname} />

            <div className="flex flex-1 pt-20 h-full relative">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md fixed top-20 bottom-0 left-0 p-6 z-20 overflow-y-auto">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <i className="bx bx-video animate-pulse"  />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">AI Video Tutor</h3>
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Virtual Professor</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        {sidebarItems.map(item => {
                            const active = pathname === item.path || (item.path === "/video-tutor" && pathname.startsWith("/video-tutor/lesson"));
                            const Icon = item.icon;
                            return (
                                <a key={item.name} href={item.path} className="block">
                                    <span className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm  duration-300 ${
                                        active 
                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950  scale-102" 
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                    }`}>
                                        <Icon size={18} className={active ? "scale-110 text-indigo-400 dark:text-indigo-600" : ""} />
                                        {item.name}
                                    </span>
                                </a>
                            );
                        })}
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            <i className="bx bx-user"  />
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{user.fullName}</p>
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">{user.role}</span>
                        </div>
                    </div>
                </aside>

                {/* Mobile Drawer Trigger */}
                <div className="md:hidden fixed bottom-6 right-6 z-40">
                    <Button 
                        size="icon" 
                        className="w-14 h-14 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950    "
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <i className="bx bx-menu"  />
                    </Button>
                </div>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isMobileOpen && (
                        <div className="fixed inset-0 z-50 md:hidden flex">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setIsMobileOpen(false)}
                            />

                            <motion.aside 
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="relative w-80 h-full bg-white dark:bg-slate-900 p-6 flex flex-col justify-between z-10 border-r border-slate-200 dark:border-slate-800"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                <i className="bx bx-video"  />
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">AI Video Tutor</h3>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="rounded-full">
                                            <i className="bx bx-x"  />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {sidebarItems.map(item => {
                                            const active = pathname === item.path || (item.path === "/video-tutor" && pathname.startsWith("/video-tutor/lesson"));
                                            const Icon = item.icon;
                                            return (
                                                <a 
                                                    key={item.name} 
                                                    href={item.path} 
                                                    onClick={() => setIsMobileOpen(false)}
                                                    className="block"
                                                >
                                                    <span className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm  ${
                                                        active 
                                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" 
                                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                                    }`}>
                                                        <Icon size={18} />
                                                        {item.name}
                                                    </span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                                        <i className="bx bx-user"  />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.fullName}</p>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">{user.role}</span>
                                    </div>
                                </div>
                            </motion.aside>
                        </div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <main className="flex-1 md:ml-72 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
                    <div className="mb-6">
                        <a href="/classroom" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 group mb-4 hover:underline">
                            <i className="bx bx-arrowleft group-hover:-translate-x-1 "  />
                            Back to Smart Classroom
                        </a>
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
}

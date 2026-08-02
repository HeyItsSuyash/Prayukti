'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AnalyticsSection() {
    return (
        <section className="py-24 bg-white dark:bg-black overflow-hidden relative">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Smart Analytics & Insights
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        Empower faculty and institutions with actionable data. Detect at-risk students, monitor real-time attendance, and track lab performance.
                    </p>
                </div>

                <div className="relative w-full max-w-5xl mx-auto">
                    {/* Main Dashboard UI Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#071D2B] shadow-2xl overflow-hidden flex flex-col relative z-20"
                    >
                        <div className="h-12 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center px-6 gap-4">
                            <div className="font-semibold text-slate-800 dark:text-white">Institution Dashboard</div>
                            <div className="ml-auto flex gap-2">
                                <div className="h-6 w-24 bg-slate-100 dark:bg-white/5 rounded"></div>
                                <div className="h-6 w-8 rounded bg-slate-100 dark:bg-white/5"></div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-transparent">
                            {/* Stats row */}
                            <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Active Students", val: "10,245", col: "text-blue-500" },
                                    { label: "Avg Attendance", val: "87.4%", col: "text-accent" },
                                    { label: "Lab Completion", val: "64%", col: "text-purple-500" },
                                    { label: "At-Risk Students", val: "124", col: "text-rose-500" }
                                ].map((s, i) => (
                                    <div key={i} className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 flex flex-col gap-2">
                                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
                                        <div className={`text-2xl font-bold ${s.col}`}>{s.val}</div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Big Chart Area */}
                            <div className="col-span-1 md:col-span-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 min-h-[300px] flex flex-col">
                                <div className="font-semibold text-slate-800 dark:text-white mb-6">Performance over Semester</div>
                                <div className="flex-1 flex items-end gap-2 px-2 relative">
                                    {/* Line chart mock using SVG */}
                                    <svg className="absolute inset-0 w-full h-full preserve-3d overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                                        <path d="M0,40 Q10,30 20,35 T40,25 T60,10 T80,20 T100,5" fill="none" stroke="url(#blue-grad)" strokeWidth="2" />
                                        <path d="M0,50 L0,40 Q10,30 20,35 T40,25 T60,10 T80,20 T100,5 L100,50 Z" fill="url(#blue-grad-fill)" opacity="0.2" />
                                        <defs>
                                            <linearGradient id="blue-grad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#4B6EF5" />
                                                <stop offset="100%" stopColor="#14D98F" />
                                            </linearGradient>
                                            <linearGradient id="blue-grad-fill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4B6EF5" />
                                                <stop offset="100%" stopColor="transparent" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>

                            {/* Risk List */}
                            <div className="col-span-1 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 flex flex-col gap-4">
                                <div className="font-semibold text-slate-800 dark:text-white">Risk Detection</div>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                        <div className="flex-1">
                                            <div className="h-3 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-1"></div>
                                            <div className="h-2 w-1/2 bg-slate-100 dark:bg-white/5 rounded"></div>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating UI Elements */}
                    <motion.div 
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-12 -right-12 z-30 hidden lg:flex rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#071D2B]/90 backdrop-blur-xl shadow-xl p-4 gap-4 items-center"
                    >
                        <div className="w-12 h-12 rounded-full conic-gradient-mock flex items-center justify-center relative bg-slate-100 dark:bg-slate-800">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-200 dark:text-white/5" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="text-accent" strokeDasharray="75, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-white">Class Attendance</div>
                            <div className="text-accent font-bold">75% Present</div>
                        </div>
                    </motion.div>

                    <motion.div 
                        animate={{ y: [-15, 15, -15] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-8 -left-8 z-30 hidden lg:flex rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#071D2B]/90 backdrop-blur-xl shadow-xl p-4 flex-col gap-2 w-48"
                    >
                        <div className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Activity Heatmap</div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({length: 28}).map((_, i) => (
                                <div key={i} className={`h-2 rounded-[2px] ${Math.random() > 0.5 ? 'bg-primary' : Math.random() > 0.3 ? 'bg-primary/50' : 'bg-slate-200 dark:bg-white/10'}`}></div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

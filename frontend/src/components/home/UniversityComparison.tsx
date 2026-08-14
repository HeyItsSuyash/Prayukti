'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function UniversityComparison() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-black overflow-hidden relative">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Why Universities Choose Prayukti
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                        A definitive upgrade over legacy systems and traditional physical labs.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071D2B]  overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Traditional Labs (Left) */}
                    <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 relative">
                        <div className="absolute inset-0 bg-rose-500/5"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-slate-400 mb-8 flex items-center gap-2">
                                <i className="bx bx-buildings"></i> Traditional Labs
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "Limited to physical campus hours",
                                    "High hardware maintenance costs",
                                    "Manual attendance & grading",
                                    "Outdated curriculum alignment",
                                    "Zero analytics or risk detection"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-4">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                                            <i className="bx bx-x text-rose-500 text-sm"></i>
                                        </div>
                                        <span className="text-slate-500 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Prayukti (Right) */}
                    <div className="flex-1 p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                                <i className="bx bx-check-shield text-primary"></i> Prayukti
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "24/7 access from any device",
                                    "Zero maintenance, cloud-native",
                                    "AI-powered grading & automated attendance",
                                    "Always updated to latest university syllabus",
                                    "Deep analytics and student risk detection"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-4">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <i className="bx bx-check text-primary text-sm"></i>
                                        </div>
                                        <span className="text-slate-900 dark:text-slate-300 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Enterprise Features Grid */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {[
                        { icon: "bx-buildings", text: "Multi-campus" },
                        { icon: "bx-shield-quarter", text: "Role Management" },
                        { icon: "bx-calendar", text: "Timetables" },
                        { icon: "bx-lock-alt", text: "SSO Security" }
                    ].map((feat, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071D2B] hover:border-primary/50 transition-colors">
                            <i className={`bx ${feat.icon} text-3xl text-slate-400 dark:text-slate-500`}></i>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{feat.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

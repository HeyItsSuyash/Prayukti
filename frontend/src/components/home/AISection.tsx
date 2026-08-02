'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function AISection() {
    const features = [
        "AI Chat", "AI Video Tutor", "Lesson Generator", 
        "Code Explainer", "Doubt Solver", "Adaptive Learning"
    ];

    return (
        <section className="py-32 bg-[#071D2B] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/20 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold border border-accent/20"
                    >
                        <i className="bx bx-bot"></i> Powered by advanced LLMs
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
                    >
                        Meet your AI <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Engineering Mentor.</span>
                    </motion.h2>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-3 pt-6"
                    >
                        {features.map((feature, idx) => (
                            <div key={idx} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm font-medium backdrop-blur-sm">
                                {feature}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Animated Chat Interface Mockup */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-[#0A1929]/80 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="h-16 border-b border-white/10 flex items-center px-6 gap-4 bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <i className="bx bx-bot text-primary text-xl"></i>
                        </div>
                        <div>
                            <div className="text-white font-semibold">Prayukti AI</div>
                            <div className="text-xs text-accent flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> Online
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-6 md:p-8 space-y-6 bg-gradient-to-b from-transparent to-black/20">
                        {/* User Message */}
                        <div className="flex items-start gap-4 flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                <i className="bx bx-user text-white"></i>
                            </div>
                            <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%] md:max-w-[70%] shadow-md">
                                <p className="text-sm md:text-base leading-relaxed">I'm struggling to understand how the pipeline registers work in the MIPS architecture simulator.</p>
                            </div>
                        </div>

                        {/* AI Message */}
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <i className="bx bx-bot text-primary"></i>
                            </div>
                            <div className="bg-white/10 border border-white/10 text-slate-200 p-4 rounded-2xl rounded-tl-sm max-w-[80%] md:max-w-[70%] shadow-md space-y-4">
                                <p className="text-sm md:text-base leading-relaxed">Pipeline registers act as temporary storage between the stages (IF, ID, EX, MEM, WB) of the MIPS datapath. Let me show you a visual diagram of what happens during the IF/ID transition.</p>
                                
                                <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-slate-300">
                                    <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                                        <span>Instruction Fetch (IF)</span>
                                        <i className="bx bx-right-arrow-alt text-primary"></i>
                                        <span>Instruction Decode (ID)</span>
                                    </div>
                                    <div className="text-primary">IF/ID.IR &lt;- Memory[PC]</div>
                                    <div className="text-accent">IF/ID.NPC &lt;- PC + 4</div>
                                </div>
                            </div>
                        </div>

                        {/* Typing Indicator */}
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <i className="bx bx-bot text-primary"></i>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm w-24 flex items-center justify-center gap-1">
                                <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full"></motion.span>
                                <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full"></motion.span>
                                <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full"></motion.span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

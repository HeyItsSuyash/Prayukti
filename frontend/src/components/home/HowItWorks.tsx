'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function HowItWorks() {
    const steps = [
        { num: "01", title: "Choose Lab", desc: "Select from hundreds of university-aligned modules." },
        { num: "02", title: "Run Simulation", desc: "Launch the digital twin instantly in your browser." },
        { num: "03", title: "Experiment", desc: "Tweak variables and observe real-time physical reactions." },
        { num: "04", title: "AI Explains", desc: "Ask the AI tutor questions if you get stuck." },
        { num: "05", title: "Take Assessment", desc: "Validate your learning through dynamic quizzes." },
        { num: "06", title: "Earn Certificate", desc: "Receive a verified credential upon mastery." }
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-[#071D2B] overflow-hidden">
            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                        How It Works
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                        A seamless workflow designed for engineering mastery.
                    </p>
                </div>

                <div className="relative">
                    {/* Animated vertical connector line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-white/5 -translate-x-1/2 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ height: "0%" }}
                            whileInView={{ height: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-full bg-gradient-to-b from-primary to-accent"
                        ></motion.div>
                    </div>

                    <div className="space-y-12">
                        {steps.map((step, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className={`relative flex items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                            >
                                {/* Center Node */}
                                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white dark:bg-[#0A1929] border-4 border-slate-50 dark:border-[#071D2B] flex items-center justify-center z-10 shadow-lg shadow-primary/20">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent"></div>
                                </div>
                                
                                {/* Content Card */}
                                <div className="ml-20 md:ml-0 md:w-1/2 flex flex-col pt-2 pb-2">
                                    <div className={`bg-white dark:bg-[#0A1929] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl ${idx % 2 === 0 ? 'md:mr-12 md:text-right' : 'md:ml-12 md:text-left'} hover:-translate-y-1 transition-transform`}>
                                        <div className="text-sm font-black text-primary/50 mb-1">{step.num}</div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

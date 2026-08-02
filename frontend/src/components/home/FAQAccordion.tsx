'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function FAQAccordion() {
    const faqs = [
        {
            q: "How does Prayukti integrate with our existing university curriculum?",
            a: "Our modules are mapped directly to standard university syllabuses (like AKTU and MMMUT). We provide a seamless integration process where faculty can select specific virtual labs that align perfectly with their course plans."
        },
        {
            q: "Do students need high-end computers to run the simulations?",
            a: "Not at all. Prayukti's digital twin simulations are fully cloud-native and render entirely in the browser. Any standard laptop or tablet with an internet connection is sufficient."
        },
        {
            q: "How does the AI Video Tutor work?",
            a: "The AI Video Tutor acts as a 24/7 teaching assistant. It can generate dynamic slides, explain complex engineering concepts through an interactive avatar, and test students' knowledge with adaptive quizzes."
        },
        {
            q: "Can faculty monitor student attendance and performance?",
            a: "Yes. The Smart Classroom module provides a comprehensive dashboard for faculty. It automates attendance tracking during virtual lab sessions and flags at-risk students based on their performance metrics."
        }
    ];

    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white dark:bg-[#071D2B] overflow-hidden">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isActive = activeIndex === idx;
                        return (
                            <div 
                                key={idx} 
                                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isActive ? 'border-primary/50 bg-slate-50 dark:bg-white/5' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:border-slate-300 dark:hover:border-white/20'}`}
                            >
                                <button 
                                    onClick={() => setActiveIndex(isActive ? null : idx)}
                                    className="w-full text-left px-6 py-6 flex items-center justify-between gap-4 focus:outline-none"
                                >
                                    <span className="font-semibold text-slate-900 dark:text-white text-lg pr-8">
                                        {faq.q}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isActive ? 'bg-primary text-white rotate-180' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                                        <i className="bx bx-chevron-down text-xl"></i>
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-6 pb-6 pt-0 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}

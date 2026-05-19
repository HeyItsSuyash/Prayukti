"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const faqs = [
    {
        question: "What is Prayukti Virtual Lab?",
        answer: "A comprehensive virtual lab environment specifically designed for engineering students at MMMUT to bridge the gap between theory and practice. It allows you to perform complex experiments online with high-fidelity simulations."
    },
    {
        question: "Is it strictly aligned with MMMUT syllabus?",
        answer: "Yes. Every experiment hosted on this platform is meticulously aligned with the official MMMUT engineering syllabus to ensure academic relevance and help you prepare for your practical exams."
    },
    {
        question: "Do I need to install any software?",
        answer: "No installation or specialized hardware is required. Our cloud-based architecture allows you to access all simulation tools and resources directly through any modern web browser."
    },
    {
        question: "How do I track my progress?",
        answer: "Every experiment you complete is automatically logged in your student dashboard. You can view your attendance, simulation scores, and download completion certificates directly from your profile."
    },
    {
        question: "Can I access labs from mobile?",
        answer: "Yes, Prayukti is built with a mobile-first philosophy. While complex simulations are best experienced on larger screens, most features and basic labs are fully accessible on smartphones."
    },
    {
        question: "What if I forget my university login?",
        answer: "You can use the 'Forgot Password' feature with your official @mmmut.ac.in email address. For roll number or enrollment issues, please contact your department coordinator."
    },
    {
        question: "Are these labs valid for internal assessments?",
        answer: "Absolutely. Prayukti is the official virtual laboratory partner for MMMUT, and many departments use these simulations as part of their continuous evaluation and lab assessment process."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-32 bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                        Frequently Asked <span className="text-accent">Questions</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] bg-slate-100 dark:bg-slate-900 inline-block px-4 py-1.5 rounded-full">
                        Comprehensive Answers for Your Journey
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white dark:bg-slate-900/40">
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="w-full flex items-center p-8 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                    >
                                        <span className="flex-shrink-0 mr-6">
                                            <motion.div
                                                animate={{ rotate: openIndex === index ? 0 : -90 }}
                                                transition={{ duration: 0.2 }}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${openIndex === index ? 'bg-accent text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                                            >
                                                <ChevronDown className="w-5 h-5" />
                                            </motion.div>
                                        </span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{faq.question}</span>
                                    </button>

                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-24 pb-10 text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-base">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                            Not what you're looking for? Try our detailed{" "}
                            <a href="/faq" className="text-accent font-bold hover:underline inline-flex items-center gap-1 group">
                                FAQ Section <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            {" "}or contact{" "}
                            <a href="/support" className="text-accent font-bold hover:underline inline-flex items-center gap-1 group">
                                Support <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

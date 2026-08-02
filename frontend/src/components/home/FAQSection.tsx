'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export function FAQSection() {
    const faqs = [
        {
            question: "What is Prayukti vLAB?",
            answer: "Prayukti vLAB is a virtual laboratory platform providing interactive simulations, code compilation, and an AI tutor for engineering students.",
            icon: "bx-message-square-error" // Closest to square with ? or similar
        },
        {
            question: "Who can use Prayukti vLAB?",
            answer: "It is designed for engineering students, faculty, and institutions looking to enhance practical learning through virtual labs.",
            icon: "bx-group"
        },
        {
            question: "Do I need to install anything?",
            answer: "No, Prayukti vLAB is entirely browser-based. You just need a modern web browser and an internet connection.",
            icon: "bx-download"
        },
        {
            question: "Is it available on mobile devices?",
            answer: "Yes, our platform is responsive and can be accessed on smartphones and tablets, though a larger screen is recommended for complex simulations.",
            icon: "bx-mobile-alt"
        },
        {
            question: "How is my data secured?",
            answer: "We use enterprise-grade encryption and comply with standard data protection regulations to ensure your academic and personal data is safe.",
            icon: "bx-shield-quarter"
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-slate-50 relative">
            <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Accordion */}
                    <div className="lg:col-span-2 space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openIndex === idx;
                            return (
                                <div 
                                    key={idx} 
                                    className={cn(
                                        "bg-white shadow-sm transition-all duration-300 border-l-[6px]",
                                        isOpen ? "border-l-primary border-t border-r border-b border-t-slate-100 border-r-slate-100 border-b-slate-100" : "border-transparent border border-slate-200"
                                    )}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                                        className="w-full text-left px-6 py-5 flex items-center justify-between bg-transparent hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <i className={cn("bx text-2xl", faq.icon, isOpen ? "text-primary" : "text-primary")}></i>
                                            <span className="font-bold text-[#021D24] text-sm md:text-base">{faq.question}</span>
                                        </div>
                                        <i className={cn(
                                            "bx text-xl text-[#021D24] transition-transform duration-300",
                                            isOpen ? "bx-chevron-up" : "bx-chevron-down"
                                        )}></i>
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="px-6 pb-6 pt-0 text-slate-500 text-sm leading-relaxed pl-16">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right: Contact Box */}
                    <div className="lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-[#021D24] p-12 shadow-2xl flex flex-col items-center text-center relative overflow-hidden h-full justify-center"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-0 border border-primary/10 rounded-full scale-[1.3]"></div>
                                <div className="absolute inset-0 border border-primary/5 rounded-full scale-[1.6]"></div>
                                <i className="bx bx-headphone text-4xl text-primary"></i>
                            </div>
                            
                            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                Still have questions?
                            </h3>
                            <h4 className="text-xl font-medium text-primary mb-6">
                                We're here to help.
                            </h4>
                            <p className="text-slate-300/80 text-base leading-relaxed mb-10 px-2">
                                Reach out to our support team and we'll get back to you.
                            </p>
                            
                            <Link href="/contact" className="w-full">
                                <button className="w-full bg-primary hover:bg-primary/90 text-white h-14 flex items-center justify-center gap-2 font-medium transition-colors text-lg">
                                    Contact Us
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

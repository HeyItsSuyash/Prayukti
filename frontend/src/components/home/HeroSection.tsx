'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    return (
        <section className="relative min-h-[90vh] flex items-center pt-28 pb-32 overflow-hidden bg-[#021D24]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="/prayukti 2.0/illustrations/hero.png" 
                    alt="University Campus Background" 
                    className="w-full h-full object-cover opacity-80 mix-blend-lighten"
                />
                {/* Gradient overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#021D24] via-[#021D24]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#021D24] via-transparent to-transparent"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 relative z-20">
                <div className="max-w-2xl">
                    {/* Massive Headline */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-[4.5rem] md:text-[5.5rem] font-bold text-white leading-[1.05] tracking-tight mb-6"
                    >
                        Virtual Labs.<br/>
                        <span className="text-primary">Real</span> Learning.
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-xl text-white/80 leading-relaxed font-normal mb-10 max-w-xl"
                    >
                        Prayukti vLAB brings college labs to your browser with interactive simulations, AI tutors, and smart analytics — empowering every student to learn, practice, and excel.
                    </motion.p>

                    {/* CTA Row */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-wrap gap-4 mb-12"
                    >
                        <Link href="/labs">
                            <Button size="lg" className="h-12 px-8 rounded-md bg-primary hover:bg-primary/90 text-white font-semibold text-base ">
                                Explore Labs
                            </Button>
                        </Link>
                        <Button onClick={() => setIsDemoOpen(true)} size="lg" variant="outline" className="h-12 px-8 rounded-md bg-transparent border-white/30 text-white hover:bg-white/10 font-semibold text-base ">
                            <i className="bx bx-play text-xl mr-2"></i> Watch Demo
                        </Button>
                    </motion.div>

                    {/* Trust Badge */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full border border-white/20 bg-black/20 flex items-center justify-center p-1">
                            <img src="/mmm-logo.png" alt="MMMUT Logo" className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white/70 text-sm font-medium">Trusted by students and faculty at</span>
                            <span className="text-white font-bold text-sm">MMMUT, Gorakhpur</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Video Demo Modal */}
            <AnimatePresence>
                {isDemoOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <button 
                            onClick={() => setIsDemoOpen(false)}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                        >
                            <i className="bx bx-x text-4xl"></i>
                        </button>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 rounded-full border-2 border-primary/50 flex items-center justify-center mb-6 text-primary relative">
                                <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20"></div>
                                <i className="bx bx-play text-4xl ml-1"></i>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Video coming soon</h2>
                            <p className="text-white/60 text-lg max-w-md">
                                We are currently putting the final touches on our interactive demo video. Check back shortly!
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

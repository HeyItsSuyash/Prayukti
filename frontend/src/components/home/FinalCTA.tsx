'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FinalCTA() {
    return (
        <section className="py-32 relative overflow-hidden bg-[#071D2B]">
            {/* Soft Glowing Mesh Background */}
            <div className="absolute inset-0 z-0 opacity-50">
                <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 mix-blend-screen"></div>
                <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto space-y-10"
                >
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        Ready to Transform <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Engineering Education?</span>
                    </h2>
                    
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                        Join the next generation of academic institutions leveraging AI and digital twins to build better engineers.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-6 pt-8">
                        <Link href="/register">
                            <Button size="lg" className="h-16 px-10 rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(75,110,245,0.6)]">
                                Start Free
                            </Button>
                        </Link>
                        <Link href="/demo">
                            <Button size="lg" className="h-16 px-10 rounded-full bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] font-bold text-lg transition-all">
                                Book Demo
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

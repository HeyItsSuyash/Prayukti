'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LabsGrid() {
    const labs = [
        { title: "Computer Networks", desc: "Simulate protocols, routing, and network behavior.", icon: "bx-globe" },
        { title: "Digital Electronics", desc: "Build and test digital circuits with interactive tools.", icon: "bx-chip" },
        { title: "Data Structures & Algo", desc: "Visualize algorithms and solve problems step by step.", icon: "bx-code-alt" },
        { title: "DBMS", desc: "Explore database concepts with practical simulations.", icon: "bx-data" },
        { title: "Operating Systems", desc: "Understand OS concepts through interactive labs.", icon: "bx-cog" },
        { title: "Microprocessors", desc: "Experience 8086 architecture with an in-built emulator.", icon: "bx-microchip" },
        { title: "OOPs", desc: "Compile and run code in multiple languages.", icon: "bx-cube-alt" },
        { title: "Compiler Design", desc: "Explore each phase of a compiler.", icon: "bx-terminal" },
        { title: "Error Detection", desc: "Learn hamming code, CRC, parity and more.", icon: "bx-check-shield" },
        { title: "Basic Electrical Engg.", desc: "Analyze circuits and electrical fundamentals.", icon: "bx-bolt-circle" }
    ];

    return (
        <section className="py-24 bg-slate-50 relative">
            <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-[#059669] font-bold text-sm tracking-wider uppercase mb-4 block">EXPLORE OUR LABS</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#021D24] leading-tight mb-4">
                        Wide Range of <span className="text-[#059669]">Virtual Labs</span>
                    </h2>
                    <p className="text-slate-500 text-lg">From circuits to algorithms, our labs cover core engineering disciplines.</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                    {labs.map((lab, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            className="bg-white border border-slate-200 p-6 flex flex-col hover:border-[#059669]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
                        >
                            {/* Small top-left icon */}
                            <div className="w-10 h-10 rounded-full border border-slate-100 bg-[#059669]/5 flex items-center justify-center self-start mb-4 group-hover:bg-[#059669]/10 transition-colors">
                                <i className={`bx ${lab.icon} text-xl text-[#059669]`}></i>
                            </div>

                            {/* Central Illustration Placeholder */}
                            <div className="flex-grow flex items-center justify-center min-h-[140px] mb-6 relative">
                                <div className="absolute inset-0 bg-slate-50/50 -skew-y-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <i className={`bx ${lab.icon} text-[5rem] text-slate-200 group-hover:text-slate-300 group-hover:scale-110 transition-all duration-500 z-10`}></i>
                            </div>
                            
                            <h3 className="font-bold text-center text-[#021D24] text-base mb-2 group-hover:text-[#059669] transition-colors">{lab.title}</h3>
                            <p className="text-slate-500 text-center text-xs leading-relaxed mb-6">{lab.desc}</p>
                            
                            <Link href="/labs" className="text-[#059669] text-sm font-semibold hover:underline flex items-center justify-center gap-1 mt-auto mx-auto">
                                Explore Labs <i className="bx bx-right-arrow-alt text-lg transition-transform group-hover:translate-x-1"></i>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

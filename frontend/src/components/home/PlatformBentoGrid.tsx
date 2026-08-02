'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PlatformBentoGrid() {
    const cards = [
        {
            title: "Circuit Simulation",
            description: "Drag, drop, and wire up digital electronics with real-time logic evaluation.",
            icon: "bx-chip",
            color: "from-blue-500/20 to-blue-600/5 text-blue-500",
            colSpan: "md:col-span-2 lg:col-span-2",
            rowSpan: "md:row-span-2",
        },
        {
            title: "Data Structures",
            description: "Visualize arrays, linked lists, and trees dynamically as your code executes.",
            icon: "bx-sitemap",
            color: "from-purple-500/20 to-purple-600/5 text-purple-500",
            colSpan: "md:col-span-1 lg:col-span-1",
            rowSpan: "md:row-span-1",
        },
        {
            title: "8086 Emulator",
            description: "Write and execute Assembly language with memory and register visualizers.",
            icon: "bx-microchip",
            color: "from-emerald-500/20 to-emerald-600/5 text-emerald-500",
            colSpan: "md:col-span-1 lg:col-span-1",
            rowSpan: "md:row-span-1",
        },
        {
            title: "DBMS Visualizer",
            description: "Write SQL queries and watch tables join and filter in real-time.",
            icon: "bx-data",
            color: "from-orange-500/20 to-orange-600/5 text-orange-500",
            colSpan: "md:col-span-1 lg:col-span-1",
            rowSpan: "md:row-span-1",
        },
        {
            title: "Compiler Design",
            description: "Step through lexical analysis, parsing, and code generation phases.",
            icon: "bx-code-curly",
            color: "from-rose-500/20 to-rose-600/5 text-rose-500",
            colSpan: "md:col-span-2 lg:col-span-2",
            rowSpan: "md:row-span-1",
        },
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-black overflow-hidden relative">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Platform Capabilities
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        Explore our comprehensive library of virtual laboratories, covering every major engineering discipline.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={cn(
                                "group relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A1929] overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col justify-end p-8",
                                card.colSpan,
                                card.rowSpan
                            )}
                        >
                            {/* Animated Background Gradient */}
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-br opacity-50 dark:opacity-20 group-hover:opacity-100 dark:group-hover:opacity-40 transition-opacity duration-500",
                                card.color.split(' ').slice(0, 2).join(' ')
                            )}></div>
                            
                            {/* Abstract Illustration Placeholder based on Icon */}
                            <div className="absolute top-8 right-8 text-8xl opacity-10 dark:opacity-20 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">
                                <i className={`bx ${card.icon}`}></i>
                            </div>

                            <div className="relative z-10">
                                <div className={cn("w-12 h-12 rounded-xl bg-white dark:bg-[#071D2B] shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center mb-6", card.color.split(' ')[2])}>
                                    <i className={`bx ${card.icon} text-2xl`}></i>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{card.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

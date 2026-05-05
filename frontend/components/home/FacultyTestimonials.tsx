"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const faculty = [
    {
        name: "Prof. Rakesh Kumar",
        title: "Head of Department (HOD)",
        department: "Computer Science & Engineering",
        message: "Prayukti represents our commitment to modernizing engineering education. By providing high-fidelity virtual environments, we empower students to experiment fearlessly and master complex concepts beyond the physical lab hours.",
        image: null // Placeholder
    },
    {
        name: "Prof. Vimal Kumar",
        title: "Professor",
        department: "Information Technology",
        message: "The integration of Prayukti into our curriculum has significantly improved student engagement. The platform's precision and real-time feedback loop are essential for nurturing the next generation of engineers.",
        image: null
    },
    {
        name: "Prof. Vipul Narayan Mishra",
        title: "Professor",
        department: "Computer Science & Engineering",
        message: "We've seen a remarkable shift in how students approach practicals. Prayukti's virtual labs provide a safety net for innovation, allowing students to test hypotheses and observe results with industrial-grade accuracy.",
        image: null
    },
    {
        name: "Prof. Swapnita Srivastav",
        title: "Professor",
        department: "Electronics & Comm. Engineering",
        message: "Engineering is about doing. Prayukti ensures that every student has a personal, 24/7 accessible laboratory. It's not just a tool; it's an extension of our vision for a digitally-empowered campus.",
        image: null
    },
    {
        name: "Prof. Sumit Kumar Vats",
        title: "Professor",
        department: "Computer Science & Engineering",
        message: "The scalability of Prayukti allows us to conduct large-scale practical sessions without hardware constraints. It is a cornerstone of our innovation ecosystem at MMMUT Gorakhpur.",
        image: null
    }
];

export function FacultyTestimonials() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % faculty.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setIndex((index + 1) % faculty.length);
    const prev = () => setIndex((index - 1 + faculty.length) % faculty.length);

    return (
        <section className="py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Institutional Vision</span>
                    <h2 className="text-4xl md:text-6xl font-black text-primary dark:text-white tracking-tighter uppercase italic leading-none">
                        Establishment <br />
                        <span className="text-blue-600">& Leadership</span>
                    </h2>
                </div>

                <div className="max-w-5xl mx-auto relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-16 border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row gap-12 items-center"
                        >
                            {/* Photo Placeholder */}
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative group shrink-0 overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                                <User className="w-20 h-20 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4 h-1 bg-accent/30 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 8, ease: "linear" }}
                                        className="h-full bg-accent"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-6">
                                <Quote className="w-12 h-12 text-accent/20" />
                                <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed">
                                    "{faculty[index].message}"
                                </p>
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight leading-none">
                                        {faculty[index].name}
                                    </h4>
                                    <p className="text-accent font-bold uppercase tracking-widest text-xs mt-2">
                                        {faculty[index].title}
                                    </p>
                                    <p className="text-slate-400 font-medium text-xs mt-1">
                                        {faculty[index].department}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-center md:justify-end gap-4 mt-8 md:absolute md:-bottom-20 md:right-0">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prev}
                            className="w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-accent hover:border-accent hover:text-white transition-all"
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={next}
                            className="w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-accent hover:border-accent hover:text-white transition-all"
                        >
                            <ChevronRight />
                        </Button>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-12 md:mt-0 md:absolute md:-bottom-16 md:left-1/2 md:-translate-x-1/2">
                        {faculty.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-1.5 transition-all duration-300 rounded-full ${
                                    index === i ? "w-8 bg-accent" : "w-2 bg-slate-300 dark:bg-slate-700"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

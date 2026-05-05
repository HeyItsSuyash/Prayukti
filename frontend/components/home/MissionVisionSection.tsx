"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useState, useEffect } from "react";

const guidance = [
    {
        name: "Prof. Rakesh Kumar",
        role: "Head of Department, CSE",
        words: "Our mission is to democratize high-quality engineering education. Prayukti serves as a bridge, ensuring that every student at MMMUT has the tools to turn theoretical concepts into practical mastery, regardless of physical lab constraints.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" // Placeholder
    },
    {
        name: "Prof. Vimal Kumar",
        role: "Professor, CSE",
        words: "Virtualization is the future of experimental learning. By providing a safe, repeatable, and data-rich environment, we empower students to fail fast, learn faster, and innovate without the fear of hardware limitations.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" // Placeholder
    },
    {
        name: "Prof. Vipul Narayan Mishra",
        role: "Professor, CSE",
        words: "Precision in simulation is our core focus. We ensure that every digital twin in Prayukti behaves exactly like its physical counterpart, maintaining the academic rigor required for a world-class engineering curriculum.",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" // Placeholder
    },
    {
        name: "Prof. Swapnita Srivastav",
        role: "Professor, CSE",
        words: "Inclusivity in technology is paramount. Prayukti ensures that laboratory resources are available 24/7, enabling students to explore and experiment at their own pace, fostering a culture of self-driven academic excellence.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" // Placeholder
    },
    {
        name: "Prof. Sumit Kumar Vats",
        role: "Professor, CSE",
        words: "The synergy between software engineering and traditional lab work is beautifully captured in Prayukti. It prepares our students for the digital-first industry they will lead after graduation.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" // Placeholder
    }
];

export function MissionVisionSection() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % guidance.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="bg-white dark:bg-slate-950 py-32 border-y border-slate-100 dark:border-slate-800">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                    
                    {/* Mission Section */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-6">
                            <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] bg-accent/10 px-4 py-1.5 rounded-full inline-block">Our Mission</span>
                            <h2 className="text-5xl font-black text-primary dark:text-white uppercase tracking-tighter leading-none">
                                Bridging Theory <br />
                                <span className="text-accent">With Practice.</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                                To provide an immersive, high-fidelity virtual laboratory environment that mirrors the physical infrastructure of MMMUT Gorakhpur, ensuring every student masters engineering principles through hands-on digital experimentation.
                            </p>
                        </div>

                        <div className="space-y-8 border-l-2 border-slate-100 dark:border-slate-800 pl-8">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-white mb-2">Accessibility</h3>
                                <p className="text-sm text-slate-500 font-medium">Removing time and physical constraints from the learning process.</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-white mb-2">Integrity</h3>
                                <p className="text-sm text-slate-500 font-medium">Maintaining the highest standards of academic rigor in simulations.</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-white mb-2">Innovation</h3>
                                <p className="text-sm text-slate-500 font-medium">Continuously evolving our digital twins with industry advancements.</p>
                            </div>
                        </div>
                    </div>

                    {/* Vision / Guidance Section (Carousel) */}
                    <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-inner">
                        <div className="absolute top-10 left-10 text-slate-200 dark:text-slate-800">
                            <Quote size={80} fill="currentColor" stroke="none" />
                        </div>
                        
                        <div className="relative z-10 min-h-[400px] flex flex-col justify-center">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="space-y-10"
                            >
                                <p className="text-2xl md:text-3xl font-bold text-primary dark:text-white leading-tight tracking-tight">
                                    "{guidance[activeIndex].words}"
                                </p>
                                
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden grayscale">
                                        <img src={guidance[activeIndex].image} alt={guidance[activeIndex].name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">{guidance[activeIndex].name}</h4>
                                        <p className="text-xs font-black text-accent uppercase tracking-widest">{guidance[activeIndex].role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Carousel Indicators */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
                            {guidance.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1 transition-all duration-500 rounded-full ${activeIndex === i ? 'w-12 bg-accent' : 'w-4 bg-slate-200 dark:bg-slate-800'}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

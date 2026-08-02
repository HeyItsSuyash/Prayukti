'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FeatureBlockProps {
    reversed?: boolean;
    title: string;
    description: string;
    benefits: string[];
    mockup: React.ReactNode;
}

function FeatureBlock({ reversed, title, description, benefits, mockup }: FeatureBlockProps) {
    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24", reversed && "lg:flex-row-reverse")}>
            <motion.div 
                initial={{ opacity: 0, x: reversed ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={cn("space-y-8", reversed ? "lg:order-2" : "lg:order-1")}
            >
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {title}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {description}
                    </p>
                </div>

                <ul className="space-y-4">
                    {benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                                <i className="bx bx-check text-accent text-sm"></i>
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                        </li>
                    ))}
                </ul>

                <Link href="#">
                    <Button variant="outline" className="rounded-full border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 group mt-4 h-12 px-6">
                        Learn More <i className="bx bx-right-arrow-alt ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </Button>
                </Link>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={cn("w-full relative", reversed ? "lg:order-1" : "lg:order-2")}
            >
                {mockup}
            </motion.div>
        </div>
    );
}

export function FeatureShowcase() {
    return (
        <section className="py-24 bg-white dark:bg-[#071D2B] overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                
                {/* Feature 1: Interactive Virtual Labs */}
                <FeatureBlock 
                    title="Interactive Virtual Labs"
                    description="Run high-fidelity digital twin simulations natively in your browser. From digital electronics to fluid mechanics, everything is strictly modeled on real-world physics."
                    benefits={[
                        "Zero-latency circuit simulators",
                        "Real-time physics and network visualizations",
                        "Standardized to university curriculums"
                    ]}
                    mockup={
                        <div className="aspect-[4/3] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0A1929] shadow-2xl overflow-hidden flex flex-col relative group">
                            <div className="h-10 border-b border-slate-200 dark:border-white/10 flex items-center px-4 gap-2 bg-white dark:bg-white/5">
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                <div className="ml-auto flex gap-2">
                                    <div className="px-3 py-1 text-[10px] font-bold uppercase rounded bg-primary/10 text-primary">Run</div>
                                    <div className="px-3 py-1 text-[10px] font-bold uppercase rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400">Reset</div>
                                </div>
                            </div>
                            <div className="flex-1 relative bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]">
                                {/* Mock Circuit */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 flex items-center justify-center">
                                    <div className="w-full h-1 bg-primary/40 relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg border-2 border-primary bg-white dark:bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform"><i className="bx bx-chip text-2xl text-primary"></i></div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-accent bg-white dark:bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform"><i className="bx bx-bulb text-2xl text-accent"></i></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                />

                {/* Feature 2: AI Video Tutor */}
                <FeatureBlock 
                    reversed
                    title="AI Video Tutor"
                    description="Your personal 24/7 engineering mentor. The AI generates diagrams, creates slides on the fly, and quizzes you to ensure concept mastery."
                    benefits={[
                        "Real-time talking avatar interface",
                        "Automatic slide and diagram generation",
                        "Adaptive micro-quizzes"
                    ]}
                    mockup={
                        <div className="aspect-square md:aspect-[4/3] relative flex items-center justify-center">
                            <img 
                                src="/prayukti 2.0/illustrations/laptop_guy.png" 
                                alt="AI Video Tutor" 
                                className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(20,217,143,0.15)]"
                            />
                        </div>
                    }
                />

                {/* Feature 3: Code Compiler */}
                <FeatureBlock 
                    title="Advanced Code Compiler"
                    description="Write, run, and debug code with our integrated Monaco editor. Analyze time and space complexity instantly with Judge0 backend."
                    benefits={[
                        "Monaco Editor with IntelliSense",
                        "Complexity and performance analysis",
                        "Integrated terminal output"
                    ]}
                    mockup={
                        <div className="aspect-[4/3] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0A1929] shadow-2xl overflow-hidden flex flex-col relative font-mono text-sm">
                            <div className="flex-1 bg-[#1E1E1E] p-4 text-slate-300 flex flex-col">
                                <div className="flex gap-4 border-b border-white/10 pb-2 mb-4">
                                    <div className="text-primary">main.cpp</div>
                                    <div className="text-slate-500">utils.h</div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div><span className="text-pink-400">#include</span> <span className="text-green-400">&lt;iostream&gt;</span></div>
                                    <br/>
                                    <div><span className="text-blue-400">int</span> <span className="text-yellow-200">main</span>() {'{'}</div>
                                    <div className="pl-4">std::cout &lt;&lt; <span className="text-orange-300">"Hello, Prayukti!"</span> &lt;&lt; std::endl;</div>
                                    <div className="pl-4"><span className="text-pink-400">return</span> <span className="text-blue-400">0</span>;</div>
                                    <div>{'}'}</div>
                                </div>
                            </div>
                            <div className="h-1/3 bg-black border-t border-white/10 p-4 text-slate-300 overflow-hidden">
                                <div className="text-xs text-slate-500 mb-2">Terminal</div>
                                <div className="text-green-400">$ g++ main.cpp && ./a.out</div>
                                <div>Hello, Prayukti!</div>
                                <div className="mt-2 text-slate-500">Execution Time: 0.012s | Memory: 1.2MB</div>
                            </div>
                        </div>
                    }
                />

                {/* Feature 4: Smart Classroom */}
                <FeatureBlock 
                    reversed
                    title="Smart Classroom"
                    description="Manage your entire academic lifecycle. View attendance, announcements, assignments, and detailed performance analytics in one beautiful dashboard."
                    benefits={[
                        "Automated attendance tracking",
                        "Assignment and timetable management",
                        "Institution-level analytics"
                    ]}
                    mockup={
                        <div className="aspect-[4/3] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0A1929] shadow-2xl overflow-hidden p-6 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-white/10 rounded-md"></div>
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-24 rounded-xl bg-primary/10 border border-primary/20 p-4 flex flex-col justify-between">
                                    <div className="text-primary text-sm font-semibold">Attendance</div>
                                    <div className="text-2xl font-bold text-primary">85%</div>
                                </div>
                                <div className="h-24 rounded-xl bg-accent/10 border border-accent/20 p-4 flex flex-col justify-between">
                                    <div className="text-accent text-sm font-semibold">Assignments</div>
                                    <div className="text-2xl font-bold text-accent">12/14</div>
                                </div>
                            </div>
                            <div className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 flex flex-col gap-4">
                                <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded"></div>
                                <div className="flex-1 flex items-end gap-2">
                                    {[40, 70, 45, 90, 65, 85, 60].map((h, i) => (
                                        <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative group">
                                            <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm group-hover:bg-primary/80 transition-colors" style={{ height: `${h}%` }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                />

            </div>
        </section>
    );
}

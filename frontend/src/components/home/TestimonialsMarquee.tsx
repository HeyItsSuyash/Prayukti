'use client';

import React from 'react';

export function TestimonialsMarquee() {
    const testimonials = [
        {
            quote: "Prayukti transformed our digital electronics curriculum. Students can now visualize logic gates firing in real-time, completely eliminating the confusion we used to see.",
            author: "Dr. Alok Sharma",
            role: "Professor of Electronics",
            institution: "MMMUT Gorakhpur",
            avatar: "AS"
        },
        {
            quote: "The AI Video Tutor feels like magic. When I was stuck on the 8086 microprocessor pipeline, the AI generated a diagram on the spot that made it instantly click.",
            author: "Priya Singh",
            role: "Computer Science Student",
            institution: "AKTU",
            avatar: "PS"
        },
        {
            quote: "Having automated attendance and deep performance analytics for all virtual lab sessions has saved our faculty hundreds of hours this semester alone.",
            author: "Prof. R.K. Verma",
            role: "Dean of Academics",
            institution: "KNIT Sultanpur",
            avatar: "RV"
        },
        {
            quote: "The complexity analysis on the code compiler is unmatched. It forces you to write optimal code, not just code that passes the test cases.",
            author: "Aman Gupta",
            role: "Software Engineering Student",
            institution: "MMMUT Gorakhpur",
            avatar: "AG"
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-[#071D2B] overflow-hidden">
            <div className="text-center mb-16 space-y-4 px-6">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Trusted by Academia
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                    See how institutions and students are accelerating their learning.
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex gap-6 px-3">
                    {/* Double the testimonials for seamless infinite scroll */}
                    {[...testimonials, ...testimonials].map((t, idx) => (
                        <div key={idx} className="w-[400px] inline-flex flex-col whitespace-normal rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-8 shadow-lg backdrop-blur-xl">
                            <div className="flex text-accent mb-6 gap-1">
                                {[1, 2, 3, 4, 5].map(i => <i key={i} className="bx bxs-star text-lg"></i>)}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-lg font-medium leading-relaxed mb-8 flex-1">
                                "{t.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{t.author}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{t.role}, {t.institution}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Fade edges */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-[#071D2B] to-transparent"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-[#071D2B] to-transparent"></div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .group:hover .animate-marquee {
                    animation-play-state: paused;
                }
            `}} />
        </section>
    );
}

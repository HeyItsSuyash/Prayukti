'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TestimonialsSection() {
    const testimonials = [
        {
            quote: "Prayukti vLAB helped me understand complex experiments so easily. The simulations are just like the real thing!",
            name: "Ananya Sharma",
            title: "3rd Year, CSE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya&backgroundColor=10b981"
        },
        {
            quote: "The analytics and attendance insights save us so much time. It's a complete solution for modern education.",
            name: "Prof. R. K. Singh",
            title: "Department of ECE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfSingh&backgroundColor=021d24"
        },
        {
            quote: "The AI Video Tutor is amazing! It explains everything in such a simple and engaging way.",
            name: "Vivek Patel",
            title: "2nd Year, EEE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vivek&backgroundColor=10b981"
        }
    ];

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
                
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-primary font-bold text-sm tracking-wider uppercase mb-4 block">What Our Users Say</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#021D24] leading-tight mb-4">Loved by Students and Faculty</h2>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-white rounded-2xl border border-slate-100 p-8  flex flex-col hover: transition-shadow"
                        >
                            <div className="text-primary/20 mb-4">
                                <i className="bx bxs-quote-alt-left text-3xl"></i>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                                <img 
                                    src={testimonial.avatar} 
                                    alt={testimonial.name} 
                                    className="w-12 h-12 rounded-full border border-slate-200"
                                />
                                <div>
                                    <h4 className="text-[#021D24] font-bold text-sm">{testimonial.name}</h4>
                                    <p className="text-slate-500 text-xs">{testimonial.title}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Dots (visual only as per lander.png) */}
                <div className="flex justify-center items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                </div>
            </div>
        </section>
    );
}

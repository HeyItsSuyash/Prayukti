'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TrustStrip() {
    const features = [
        {
            title: "Interactive Simulations",
            description: "Practice experiments in a safe virtual environment.",
            icon: "bx bx-test-tube"
        },
        {
            title: "Code. Compile. Learn.",
            description: "Write, run and analyze code without any setup.",
            icon: "bx bx-code-alt"
        },
        {
            title: "Smart Analytics",
            description: "Track performance, attendance and learning progress.",
            icon: "bx bx-bar-chart-alt-2"
        },
        {
            title: "Secure & Reliable",
            description: "Enterprise-grade platform built for education.",
            icon: "bx bx-shield"
        }
    ];

    return (
        <section className="relative z-30 -mt-20">
            <div className="container mx-auto px-6 lg:px-12">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className="text-3xl text-primary mt-1">
                                    <i className={feature.icon}></i>
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-[#021D24] mb-2">{feature.title}</h2>
                                    <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function MissionSection() {
    const features = [
        {
            title: "Student First",
            description: "Designed for real learning",
            icon: "bx bx-user"
        },
        {
            title: "AI Powered",
            description: "Intelligent tutors and insights",
            icon: "bx bx-chip"
        },
        {
            title: "Always Improving",
            description: "Continuously built with feedback",
            icon: "bx bx-refresh"
        },
        {
            title: "Inclusive",
            description: "Accessible to every learner",
            icon: "bx bx-world"
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-primary font-bold text-sm tracking-wider uppercase mb-4 block">Our Mission</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#021D24] leading-tight mb-6">
                            Making Quality Engineering<br />Education Accessible to All
                        </h2>
                        <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
                            We bridge the gap between theory and practice by providing accessible, affordable, and intelligent lab experiences. Our mission is to empower students, support faculty, and elevate outcomes through technology.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-8">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                    <i className={`${feature.icon} text-2xl text-primary`}></i>
                                    <h4 className="text-[#021D24] font-bold text-sm">{feature.title}</h4>
                                    <p className="text-slate-500 text-xs">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative flex justify-center items-center"
                    >
                        <img 
                            src="/prayukti 2.0/illustrations/laptop_guy.png" 
                            alt="Student learning on laptop" 
                            className="w-full max-w-[500px] h-auto object-contain"
                        />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

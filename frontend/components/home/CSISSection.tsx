"use client";

import { motion } from "framer-motion";
import { ExternalLink, Twitter, Linkedin, Globe, Command } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CSISSection() {
    return (
        <section className="bg-slate-950 py-32 relative overflow-hidden">
            {/* Professional Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    
                    <div className="lg:w-1/2 space-y-8">
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <Command className="w-5 h-5 text-accent" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Developer Unit</span>
                        </div>
                        
                        <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                            CSIS <span className="text-accent">MMMUT</span>
                        </h2>
                        
                        <div className="space-y-6">
                            <p className="text-lg text-slate-400 font-medium leading-relaxed">
                                The Computer Science and Innovation Society (CSIS) is the premier technical body of MMMUT Gorakhpur. Our mission is to foster a culture of technological excellence and community-driven development.
                            </p>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Prayukti was conceptualized and built by CSIS to solve a fundamental challenge in engineering education: access to laboratory infrastructure. By leveraging modern web technologies and physics-based simulations, we've created a platform that empowers students to experiment without boundaries.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <a href="https://csis-mmmut.org" target="_blank" rel="noopener noreferrer">
                                <Button className="h-14 px-8 rounded-xl bg-white text-primary hover:bg-slate-200 border-0 font-black uppercase tracking-widest text-[10px] gap-2 group">
                                    Visit Official Site <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>
                            </a>
                            
                            <div className="flex items-center gap-4">
                                {[
                                    { icon: Twitter, href: "#" },
                                    { icon: Linkedin, href: "#" },
                                    { icon: Globe, href: "#" }
                                ].map((social, i) => (
                                    <a 
                                        key={i} 
                                        href={social.href} 
                                        className="w-14 h-14 rounded-xl border-2 border-white/10 flex items-center justify-center text-white hover:border-accent hover:text-accent transition-all group"
                                    >
                                        <social.icon size={20} className="group-hover:scale-110 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2">
                        <div className="relative group">
                            <div className="relative bg-slate-900 border border-white/5 rounded-[3rem] p-12 space-y-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <h4 className="text-4xl font-black text-white">50+</h4>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Developers</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-4xl font-black text-white">12+</h4>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ongoing Projects</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-4xl font-black text-white">500+</h4>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Community Members</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-4xl font-black text-white">05+</h4>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Year History</p>
                                    </div>
                                </div>
                                <div className="p-8 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-sm text-slate-400 font-bold leading-relaxed">
                                        "Innovating for the students, by the students. Prayukti is a testament to what collegiate collaboration can achieve."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

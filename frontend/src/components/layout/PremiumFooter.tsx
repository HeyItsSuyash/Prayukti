'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PremiumFooter() {
    return (
        <footer className="bg-[#021D24] dark:bg-background text-white pt-20 pb-8 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img
                                    src="/prayukti 2.0/logo/logo_blue.png"
                                    alt="Prayukti Logo"
                                    className="w-full h-full object-contain brightness-0 invert scale-110"
                                />
                            </div>
                            <div className="flex items-center">
                                <span className="text-xl font-bold text-white leading-none tracking-tight">Prayukti</span>
                                <span className="text-xl font-light text-white/70 leading-none ml-1">vLAB</span>
                            </div>
                        </Link>
                        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                            Empowering engineering education through virtual labs, AI tutors, and smart analytics.
                        </p>
                        
                        {/* Socials */}
                        <div className="flex items-center gap-3 pt-2">
                            <Link href="https://twitter.com/mmmut" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white ">
                                <i className="bx bxl-twitter"></i>
                            </Link>
                            <Link href="https://linkedin.com/school/mmmut" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white ">
                                <i className="bx bxl-linkedin"></i>
                            </Link>
                            <Link href="https://instagram.com/mmmut" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white ">
                                <i className="bx bxl-instagram"></i>
                            </Link>
                            <Link href="https://youtube.com/mmmut" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white ">
                                <i className="bx bxl-youtube"></i>
                            </Link>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 text-sm">Platform</h4>
                        <ul className="space-y-4">
                            <li><Link href="/labs" className="text-slate-400 hover:text-white transition-colors text-sm">Labs</Link></li>
                            <li><Link href="/coming-soon?feature=Features" className="text-slate-400 hover:text-white transition-colors text-sm">Features</Link></li>
                            <li><Link href="/coming-soon?feature=Pricing" className="text-slate-400 hover:text-white transition-colors text-sm">Pricing</Link></li>
                            <li><Link href="/coming-soon?feature=Updates" className="text-slate-400 hover:text-white transition-colors text-sm">Updates</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6 text-sm">For Educators</h4>
                        <ul className="space-y-4">
                            <li><Link href="/coming-soon?feature=Teachers" className="text-slate-400 hover:text-white transition-colors text-sm">For Teachers</Link></li>
                            <li><Link href="/coming-soon?feature=Smart%20Classroom" className="text-slate-400 hover:text-white transition-colors text-sm">Smart Classroom</Link></li>
                            <li><Link href="/coming-soon?feature=Analytics" className="text-slate-400 hover:text-white transition-colors text-sm">Analytics</Link></li>
                            <li><Link href="/coming-soon?feature=Resources" className="text-slate-400 hover:text-white transition-colors text-sm">Resources</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6 text-sm">Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="/coming-soon?feature=About%20Us" className="text-slate-400 hover:text-white transition-colors text-sm">About Us</Link></li>
                            <li><Link href="/coming-soon?feature=Contact%20Us" className="text-slate-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
                            <li><Link href="/coming-soon?feature=Careers" className="text-slate-400 hover:text-white transition-colors text-sm">Careers</Link></li>
                            <li><Link href="/coming-soon?feature=Privacy%20Policy" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6 text-sm">Support</h4>
                        <ul className="space-y-4">
                            <li><Link href="/coming-soon?feature=Help%20Center" className="text-slate-400 hover:text-white transition-colors text-sm">Help Center</Link></li>
                            <li><Link href="/coming-soon?feature=FAQs" className="text-slate-400 hover:text-white transition-colors text-sm">FAQs</Link></li>
                            <li><Link href="/coming-soon?feature=Terms%20of%20Service" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-slate-500 text-sm">
                        © 2026 Prayukti vLAB. All rights reserved.
                    </div>
                    
                    <div className="text-slate-500 text-sm">
                        A part of something bigger.
                    </div>
                </div>
            </div>
        </footer>
    );
}

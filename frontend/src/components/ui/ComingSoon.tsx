'use client';

import React from 'react';
import Link from 'next/link';

interface ComingSoonProps {
    title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
    return (
        <section className="min-h-[80vh] flex items-center justify-center bg-background py-20 px-6">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
                <div className="w-80 h-80 md:w-96 md:h-96 mb-4 relative drop- animate-in zoom-in duration-700">
                    <img 
                        src="/prayukti 2.0/illustrations/laptop_guy.png" 
                        alt="Coming Soon" 
                        className="w-full h-full object-contain"
                    />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                    <span className="text-[#059669]">{title}</span> coming soon
                </h1>
                
                <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
                    We are working continuously around the clock to ship this feature as soon as possible. Please be patient, it's going to be worth the wait!
                </p>
                
                <Link href="/" className="inline-flex items-center justify-center h-12 px-8 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl  shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] .5">
                    <i className="bx bx-left-arrow-alt text-xl mr-2"></i>
                    Return Home
                </Link>
            </div>
        </section>
    );
}

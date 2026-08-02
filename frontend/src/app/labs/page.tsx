import React from 'react';
import { PremiumNavbar } from '@/components/layout/PremiumNavbar';
import { PremiumFooter } from '@/components/layout/PremiumFooter';
import { LabsGrid } from '@/components/home/LabsGrid';

export default function LabsPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PremiumNavbar pathname="/labs" />
            
            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-[#021D24] text-white">
                <div className="container mx-auto px-6 max-w-7xl text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Virtual Labs</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Explore our comprehensive collection of interactive engineering laboratories, designed to bridge the gap between theory and practice.
                    </p>
                </div>
            </section>
            
            {/* Content */}
            <div className="flex-grow">
                <LabsGrid />
            </div>

            <PremiumFooter />
        </main>
    );
}

import React from 'react';
import { PremiumNavbar } from '@/components/layout/PremiumNavbar';
import { LabsGrid } from '@/components/home/LabsGrid';

export default function LabsPage() {
    return (
        <main className="h-screen bg-background flex flex-col font-sans transition-colors overflow-hidden">
            <PremiumNavbar pathname="/labs" />
            
            {/* Hero Section */}
            <div className="flex-1 overflow-y-auto w-full">
            <section 
                className="pt-48 pb-32 text-white relative bg-slate-950"
                style={{ 
                    backgroundImage: "linear-gradient(to right, rgba(2, 6, 23, 0.85), rgba(5, 46, 35, 0.7)), url('/prayukti 2.0/illustrations/labpic.jpg')", 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                }}
            >
                <div className="container mx-auto px-6 max-w-7xl text-center relative z-10">
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

            </div>
        </main>
    );
}

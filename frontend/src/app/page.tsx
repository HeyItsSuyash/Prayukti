'use client';

import React, { useEffect } from 'react';
import { PremiumNavbar } from '@/components/layout/PremiumNavbar';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustStrip } from '@/components/home/TrustStrip';
import { MissionSection } from '@/components/home/MissionSection';
import { LabsGrid } from '@/components/home/LabsGrid';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FAQSection } from '@/components/home/FAQSection';
import { PremiumFooter } from '@/components/layout/PremiumFooter';

export default function Home() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasUser = localStorage.getItem('vlab_user');
            const hasToken = localStorage.getItem('vlab_access_token') || document.cookie.includes('vlab_access_token');
            if (hasUser && hasToken) {
                window.location.href = '/dashboard';
            }
        }
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PremiumNavbar pathname="/" />
            
            <HeroSection />
            <TrustStrip />
            <MissionSection />
            <LabsGrid />
            {/* <TestimonialsSection /> - Hidden for now, to be implemented later */}
            <FAQSection />

            <PremiumFooter />
        </main>
    );
}

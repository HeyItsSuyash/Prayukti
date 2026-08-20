'use client';

import React, { Suspense } from 'react';
import { PremiumNavbar } from '@/components/layout/PremiumNavbar';
import { PremiumFooter } from '@/components/layout/PremiumFooter';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { useSearchParams } from 'next/navigation';

function ComingSoonContent() {
    const searchParams = useSearchParams();
    const feature = searchParams.get('feature') || 'This Feature';
    
    return (
        <div className="flex-grow pt-24">
            <ComingSoon title={feature} />
        </div>
    );
}

export default function ComingSoonPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col font-sans">
            <PremiumNavbar pathname="/coming-soon" />
            <Suspense fallback={<div className="flex-grow pt-24 flex items-center justify-center h-[50vh]"><i className="bx bx-loader-alt bx-spin text-4xl text-primary" /></div>}>
                <ComingSoonContent />
            </Suspense>
            <PremiumFooter />
        </main>
    );
}

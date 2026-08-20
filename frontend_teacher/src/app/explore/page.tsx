import React from 'react';
import { PremiumNavbar } from '@/components/layout/PremiumNavbar';
import { PremiumFooter } from '@/components/layout/PremiumFooter';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function ExplorePage() {
    return (
        <main className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
            <PremiumNavbar pathname="/explore" />
            
            <div className="flex-grow pt-24">
                <ComingSoon title="Explore" />
            </div>

            <PremiumFooter />
        </main>
    );
}

"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
            <Navbar />
            
            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <header className="mb-16">
                        <h1 className="text-5xl md:text-7xl font-black text-primary dark:text-white tracking-tighter uppercase leading-none mb-4">
                            Terms of <span className="text-accent">Service</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: May 2025</p>
                    </header>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">1. Acceptance of Terms</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                By accessing and using the Prayukti Virtual Laboratory platform, you agree to comply with and be bound by these Terms of Service. This platform is provided exclusively for the academic use of students and faculty of Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">2. Use of Platform</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Users are granted a limited, non-exclusive license to access simulation tools and academic resources. Any attempt to reverse engineer, disrupt services, or use the platform for non-academic commercial purposes is strictly prohibited.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">3. Academic Integrity</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Students must use the platform honestly. Simulation results and certificates generated on Prayukti must reflect the student's own work. Fraudulent activities or impersonation will be reported to the respective department heads.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">4. Intellectual Property</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                All simulation models, software code, and educational content are the intellectual property of Prayukti x MMMUT and its developers. Unauthorized distribution of platform content is a violation of university policy.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

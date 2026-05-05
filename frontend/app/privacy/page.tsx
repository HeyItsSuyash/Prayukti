"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
            <Navbar />
            
            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <header className="mb-16">
                        <h1 className="text-5xl md:text-7xl font-black text-primary dark:text-white tracking-tighter uppercase leading-none mb-4">
                            Privacy <span className="text-accent">Policy</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: May 2025</p>
                    </header>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">1. Information We Collect</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                We collect minimal data necessary for academic tracking: official university email, roll number, enrollment number, and academic progress (lab scores and attendance).
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight italic">2. How We Use Data</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Your data is used exclusively to maintain your academic profile, generate certificates, and provide faculty with progress reports. We do not sell or share your data with third-party advertisers.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight italic">3. Data Security</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                We implement industry-standard encryption (AES-256) and secure JWT-based authentication to protect your university credentials and academic records.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight italic">4. University Access</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Authorized university faculty and administrators have access to your performance data for internal assessment purposes only.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

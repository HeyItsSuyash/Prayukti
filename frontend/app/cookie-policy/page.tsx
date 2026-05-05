"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
            <Navbar />
            
            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <header className="mb-16">
                        <h1 className="text-5xl md:text-7xl font-black text-primary dark:text-white tracking-tighter uppercase leading-none mb-4">
                            Cookie <span className="text-accent">Policy</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: May 2025</p>
                    </header>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">1. Use of Cookies</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Prayukti uses strictly necessary cookies to maintain your login session and security tokens. These are essential for the platform to function.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">2. Types of Cookies</h2>
                            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 font-medium space-y-2">
                                <li><strong>Session Cookies:</strong> Temporary cookies used to identify your session while you are active.</li>
                                <li><strong>Security Cookies:</strong> HttpOnly cookies used to store your secure authentication tokens (JWT).</li>
                                <li><strong>Preference Cookies:</strong> Used to remember your theme choice (Light/Dark mode).</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">3. Managing Cookies</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                You can disable cookies in your browser settings, but please note that this will prevent you from logging in and accessing the virtual lab modules.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

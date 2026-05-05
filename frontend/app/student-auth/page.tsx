"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, LogIn, GraduationCap, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function StudentAuthSelection() {
    return (
        <div className="h-screen flex flex-col bg-white font-sans selection:bg-orange-100 overflow-hidden">
            <main className="flex-1 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">

                    {/* Back Button */}
                    <Link href="/" className="absolute -top-12 left-0 flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors">
                        <ChevronLeft size={16} /> Back to website
                    </Link>


                    {/* New Student Registration */}
                    <div className="bg-white p-10 rounded-[2rem] shadow-xl border-2 border-slate-100 flex flex-col items-center text-center transition-all hover:border-accent group">
                        <div className="w-20 h-20 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <UserPlus size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-primary mb-4 tracking-tight">NEW STUDENT</h2>
                        <p className="text-slate-500 mb-8 font-medium">
                            First time here? Register with your university email to access the virtual labs and track your progress.
                        </p>
                        <Link href="/register" className="w-full mt-auto">
                            <Button className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-white rounded-xl shadow-lg shadow-accent/20 border-0">
                                REGISTRATION
                            </Button>
                        </Link>
                    </div>

                    {/* Already Registered Login */}
                    <div className="bg-primary p-10 rounded-[2rem] shadow-xl border-2 border-primary/80 flex flex-col items-center text-center transition-all hover:border-white group">
                        <div className="w-20 h-20 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <LogIn size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">EXISTING STUDENT</h2>
                        <p className="text-white/70 mb-8 font-medium">
                            Already have an account? Sign in to continue your experiments and view your certificates.
                        </p>
                        <Link href="/login" className="w-full mt-auto">
                            <Button className="w-full h-14 text-lg font-bold bg-white text-primary hover:bg-slate-100 rounded-xl shadow-lg border-0">
                                STUDENT LOGIN
                            </Button>
                        </Link>
                    </div>

                </div>
            </main>

            <div className="bg-white py-8 border-t border-slate-100">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <GraduationCap size={16} />
                        <span>MMMUT UNIVERSITY ACCESS ONLY</span>
                    </div>
                    <span className="hidden md:block">•</span>
                    <span>SECURE AUTHENTICATION SYSTEM</span>
                </div>
            </div>
        </div>
    );
}

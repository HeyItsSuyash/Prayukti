"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/api';
import { API_URL } from '@/lib/config';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2000);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            loginSchema.parse({ email, password });
        } catch (e: any) {
            let errorMsg = 'Invalid email or password format';
            if (e && e.issues && Array.isArray(e.issues) && e.issues.length > 0) {
                errorMsg = e.issues[0].message;
            } else if (e && e.errors && Array.isArray(e.errors) && e.errors.length > 0) {
                const first = e.errors[0];
                errorMsg = typeof first === 'string' ? first : (first.message || JSON.stringify(first));
            } else if (typeof e?.message === 'string') {
                errorMsg = e.message;
            }
            showToast('error', errorMsg);
            setLoading(false);
            return;
        }

        try {
            const endpoint = '/api/auth/login';
            const response = await axios.post(`${API_URL}${endpoint}`, {
                email,
                password
            }, { withCredentials: true });

            const { token, user } = response.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem("studentName", user.fullName || "");
                localStorage.setItem("studentRoll", user.rollNo || "");
                localStorage.setItem("vlab_user", JSON.stringify(user));
                localStorage.setItem("vlab_access_token", token);
            }

            // Sync token with Next.js middleware so it is set as a first-party cookie
            await fetch('/api/auth/set-cookie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            showToast('success', "You're in! Setting up the dashboard...");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);

        } catch (err: any) {
            let message = err.response?.data?.message || "Login failed, please try again after some time";
            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }
            showToast('error', message);

            // Special handling for unverified accounts
            if (message === "Your account is not verified") {
                localStorage.setItem("verifyEmail", email);
                window.location.href = "/verify";
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="h-screen w-full flex bg-white font-sans overflow-hidden relative">
            {/* Custom Toast */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white border shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl py-3 px-5 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === 'success' ? 'border-blue-500/20' : 'border-red-500/20'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                        <i className={`bx ${toast.type === 'success' ? 'bx-check-circle' : 'bx-error-circle'} text-xl`}></i>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{toast.message}</p>
                </div>
            )}

            {/* Left Column - Branding & Illustration (Blue Accent Overlay) */}
            <div className="hidden lg:flex w-1/2 bg-blue-900 relative flex-col justify-between p-12 overflow-hidden">
                {/* Background Illustration with Blue Color Filter Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/prayukti 2.0/illustrations/login_page.png" 
                        alt="Campus" 
                        className="w-full h-full object-cover opacity-70 filter hue-rotate-[90deg] saturate-150"
                    />
                    {/* Dark Blue gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900/70 to-blue-950/90"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Logo */}
                    <div>
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img
                                    src="/prayukti 2.0/logo/logo_blue.png"
                                    alt="Prayukti Logo"
                                    className="w-full h-full object-contain brightness-0 invert scale-110"
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    <span className="text-2xl font-bold text-white leading-none tracking-tight">Prayukti</span>
                                    <span className="text-2xl font-light text-blue-400 leading-none ml-1">vLAB</span>
                                </div>
                                <span className="text-xs text-white/80 mt-1 font-medium tracking-wide">MMMUT, Gorakhpur</span>
                            </div>
                        </Link>
                    </div>

                    {/* Middle Text */}
                    <div className="mt-24 max-w-lg">
                        <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider mb-4">Teacher Portal</span>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Faculty OS.<br />
                            Smart Learning.
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed max-w-md">
                            Empowering engineering educators with AI question generation, resource-driven teaching, and live smart classes.
                        </p>
                        
                        <div className="w-12 h-1 bg-blue-400 mt-8 rounded-full"></div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-auto pt-20">
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { icon: 'bx-chalkboard', title: 'Smart Classes', desc: 'Schedule and manage live sessions' },
                                { icon: 'bx-file', title: 'Teaching Resources', desc: 'PDF, notes and experiment materials' },
                                { icon: 'bx-sparkles', title: 'AI Questions', desc: 'Extract questions from resources' },
                                { icon: 'bx-shield', title: 'Teacher RBAC', desc: 'Role-based access control' }
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col items-center text-center group cursor-default">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-4 backdrop-blur-md group-hover:bg-white/20 transition-colors">
                                        <i className={`bx ${feature.icon} text-2xl text-blue-400`}></i>
                                    </div>
                                    <h4 className="text-white font-semibold text-[13px] mb-1.5">{feature.title}</h4>
                                    <p className="text-white/60 text-[11px] leading-relaxed px-1">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full lg:w-1/2 bg-transparent lg:bg-[#FAFAFA] flex flex-col items-center justify-center relative p-8 sm:p-12 min-h-screen lg:min-h-0">
                {/* Mobile Background Image */}
                <div className="absolute inset-0 z-0 lg:hidden">
                    <img 
                        src="/prayukti 2.0/illustrations/login_page.png" 
                        alt="Background" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                </div>

                {/* Card Container */}
                <div className="w-full max-w-[480px] bg-white rounded-none lg:rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-10 sm:p-12 relative z-10">
                    <div className="text-center mb-10">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 font-bold text-xs rounded-full mb-3 uppercase tracking-wider">Teacher Authentication</span>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Faculty Sign In</h2>
                        <p className="text-slate-500 text-sm">Access your Prayukti Teacher Dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                                    {/* Email Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 block text-left">Faculty Email</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <i className="bx bx-envelope text-slate-400 group-focus-within:text-blue-600 text-lg transition-colors"></i>
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="faculty@mmmut.ac.in"
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                                                required
                                                suppressHydrationWarning
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 block text-left">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <i className="bx bx-lock-alt text-slate-400 group-focus-within:text-blue-600 text-lg transition-colors"></i>
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                                                required
                                                suppressHydrationWarning
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                                suppressHydrationWarning
                                            >
                                                <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-lg`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all mt-4 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                                        suppressHydrationWarning
                                    >
                                        {loading ? <i className="bx bx-loader-alt bx-spin text-xl" /> : "Sign In to Teacher Portal"}
                                    </button>
                                </form>

                                <div className="mt-8 text-center border-t pt-4">
                                    <p className="text-xs text-slate-400">
                                        Faculty accounts are provisioned by institution administrator.
                                    </p>
                                </div>
                </div>
            </div>
        </main>
    );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/api';
import { API_URL } from '@/lib/config';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address').endsWith('@mmmut.ac.in', 'Only @mmmut.ac.in emails are allowed'),
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
            if (e instanceof z.ZodError) {
                const zodError = e as any;
                showToast('error', zodError.errors[0].message);
                setLoading(false);
                return;
            }
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
            const message = err.response?.data?.message || "Login failed, please try again after some time";
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
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white border shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl py-3 px-5 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === 'success' ? 'border-[#059669]/20' : 'border-red-500/20'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-[#059669]/10 text-[#059669]' : 'bg-red-50 text-red-500'}`}>
                        <i className={`bx ${toast.type === 'success' ? 'bx-check-circle' : 'bx-error-circle'} text-xl`}></i>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{toast.message}</p>
                </div>
            )}

            {/* Left Column - Branding & Illustration */}
            <div className="hidden lg:flex w-1/2 bg-[#084738] relative flex-col justify-between p-12 overflow-hidden">
                {/* Background Illustration */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/prayukti 2.0/illustrations/login_page.png" 
                        alt="Campus" 
                        className="w-full h-full object-cover opacity-80"
                    />
                    {/* Gradient overlay to ensure top text is readable and blends well */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#084738] via-[#084738]/60 to-transparent"></div>
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
                                    <span className="text-2xl font-light text-[#14D98F] leading-none ml-1">vLAB</span>
                                </div>
                                <span className="text-xs text-white/80 mt-1 font-medium tracking-wide">MMMUT, Gorakhpur</span>
                            </div>
                        </Link>
                    </div>

                    {/* Middle Text */}
                    <div className="mt-24 max-w-lg">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Virtual Labs.<br />
                            Real Learning.
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed max-w-md">
                            Empowering engineering education through interactive simulations and smart analytics.
                        </p>
                        
                        <div className="w-12 h-1 bg-[#14D98F] mt-8 rounded-full"></div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-auto pt-20">
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { icon: 'bx-test-tube', title: 'Virtual Experiments', desc: 'Hands-on learning in a virtual environment' },
                                { icon: 'bx-code-alt', title: 'Code Execution', desc: 'Compile, run and analyze your code' },
                                { icon: 'bx-bar-chart-alt-2', title: 'Smart Analytics', desc: 'Track progress and get insights' },
                                { icon: 'bx-shield', title: 'Secure Platform', desc: 'Enterprise-grade security & privacy' }
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col items-center text-center group cursor-default">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                        <i className={`bx ${feature.icon} text-2xl text-[#14D98F]`}></i>
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
            <div className="w-full lg:w-1/2 bg-[#FAFAFA] flex flex-col items-center justify-center relative p-8 sm:p-12">
                {/* Card Container */}
                <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-10 sm:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                        <p className="text-slate-500 text-sm">Sign in to access your Prayukti vLAB account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                                    {/* Email Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 block text-left">Email</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <i className="bx bx-envelope text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@mmmut.ac.in"
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none  text-sm text-slate-700 placeholder:text-slate-400"
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
                                                <i className="bx bx-lock-alt text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none  text-sm text-slate-700 placeholder:text-slate-400"
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
                                        <div className="flex justify-end pt-1">
                                            <Link href="/forgot-password" className="text-sm font-medium text-[#059669] hover:text-[#047857] transition-colors">
                                                Forgot password?
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl  shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] .5 mt-2 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                                        suppressHydrationWarning
                                    >
                                        {loading ? <i className="bx bx-loader-alt bx-spin text-xl" /> : "Sign In"}
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-sm text-slate-500">
                                        Don't have an account? <Link href="/register" className="font-semibold text-[#059669] hover:text-[#047857] transition-colors">Register here</Link>
                                    </p>
                                </div>
                </div>
            </div>
        </main>
    );
}

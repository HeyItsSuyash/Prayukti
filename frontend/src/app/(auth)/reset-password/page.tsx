"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/config';
import { z } from 'zod';

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!id || !token) {
            showToast('error', 'Invalid reset link. Missing token.');
            return;
        }

        setLoading(true);

        const validation = resetPasswordSchema.safeParse({ password, confirmPassword });
        if (!validation.success) {
            showToast('error', validation.error?.issues?.[0]?.message || 'Invalid input');
            setLoading(false);
            return;
        }

        try {
            const endpoint = '/api/auth/reset-password';
            const response = await axios.post(`${API_URL}${endpoint}`, { 
                id, 
                token, 
                password 
            }, { withCredentials: true });
            
            showToast('success', response.data.message || 'Password reset successfully!');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            const message = err.response?.data?.message || "Failed to reset password. The link might be expired or invalid.";
            showToast('error', message);
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
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/prayukti 2.0/illustrations/login_page.png" 
                        alt="Campus" 
                        className="w-full h-full object-cover opacity-80"
                    />
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

            {/* Right Column - Reset Password Form */}
            <div className="w-full lg:w-1/2 bg-[#FAFAFA] flex flex-col items-center justify-center relative p-8 sm:p-12">
                {/* Card Container */}
                <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-10 sm:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h2>
                        <p className="text-slate-500 text-sm">Enter your new password below.</p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-6">
                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block text-left">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="bx bx-lock-alt text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                    className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400"
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

                        {/* Confirm Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block text-left">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="bx bx-lock-alt text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                    className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400"
                                    required
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5 mt-2 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                            suppressHydrationWarning
                        >
                            {loading ? <i className="bx bx-loader-alt bx-spin text-xl" /> : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-white"><i className="bx bx-loader-alt bx-spin text-4xl text-[#059669]"></i></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

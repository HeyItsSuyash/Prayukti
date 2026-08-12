"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/api';
import { API_URL } from '@/lib/config';
import { z } from 'zod';

const emailSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address').endsWith('@mmmut.ac.in', 'Only @mmmut.ac.in emails are allowed'),
});

const resetSchema = z.object({
    otp: z.string().min(6, 'OTP must be 6 characters').max(6, 'OTP must be 6 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            emailSchema.parse({ email });
        } catch (e: any) {
            if (e instanceof z.ZodError) {
                const zodError = e as any;
                showToast('error', zodError.errors[0].message);
                setLoading(false);
                return;
            }
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            showToast('success', response.data.message || 'OTP sent to your email.');
            setStep('reset');
        } catch (err: any) {
            const message = err.response?.data?.message || "Failed to send reset email. Please try again later.";
            showToast('error', message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            resetSchema.parse({ otp, password, confirmPassword });
        } catch (e: any) {
            if (e instanceof z.ZodError) {
                const zodError = e as any;
                showToast('error', zodError.errors[0].message);
                setLoading(false);
                return;
            }
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
                email,
                otp,
                new_password: password
            });

            showToast('success', response.data.message || 'Password reset successfully.');
            
            // Redirect to login after successful reset
            setTimeout(() => {
                window.location.href = "/login";
            }, 2500);

        } catch (err: any) {
            const message = err.response?.data?.message || "Failed to reset password. The OTP might be invalid or expired.";
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
                        src="/prayukti 2.0/illustrations/laptop_guy.png" 
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

                    <div className="mt-24 max-w-lg">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Virtual Labs.<br />
                            Real Learning.
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed max-w-md">
                            Securely recover your account and get back to interactive simulations and smart analytics.
                        </p>
                        
                        <div className="w-12 h-1 bg-[#14D98F] mt-8 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Column - Reset Form */}
            <div className="w-full lg:w-1/2 bg-[#FAFAFA] flex flex-col items-center justify-center relative p-8 sm:p-12">
                <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-10 sm:p-12 relative">
                    
                    <Link href="/login" className="absolute top-8 left-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                        <i className="bx bx-left-arrow-alt text-2xl"></i>
                    </Link>

                    <div className="text-center mb-10 mt-6">
                        <div className="w-16 h-16 bg-[#059669]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <i className="bx bx-shield-quarter text-3xl text-[#059669]"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h2>
                        <p className="text-slate-500 text-sm">
                            {step === 'email' ? "Enter your email to receive a recovery code" : "Check your email for the recovery code"}
                        </p>
                    </div>

                    {step === 'email' ? (
                        <form onSubmit={handleRequestReset} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block text-left">University Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i className="bx bx-envelope text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@mmmut.ac.in"
                                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400"
                                        required
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5 mt-2 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                                suppressHydrationWarning
                            >
                                {loading ? <i className="bx bx-loader-alt bx-spin text-xl" /> : "Send Recovery Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {/* OTP */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block text-left">Recovery Code</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i className="bx bx-hash text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="6-digit code"
                                        maxLength={6}
                                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all text-sm text-slate-700 tracking-[0.2em] font-medium"
                                        required
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            {/* New Password */}
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
                                        placeholder="At least 6 characters"
                                        className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400"
                                        required
                                        suppressHydrationWarning
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-lg`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block text-left">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i className="bx bx-check-shield text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400"
                                        required
                                        suppressHydrationWarning
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <i className={`bx ${showConfirmPassword ? 'bx-hide' : 'bx-show'} text-lg`}></i>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5 mt-2 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                                suppressHydrationWarning
                            >
                                {loading ? <i className="bx bx-loader-alt bx-spin text-xl" /> : "Reset Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}

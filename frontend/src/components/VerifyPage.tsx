"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:5000";

export default function VerifyPage() {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedEmail = localStorage.getItem("verifyEmail");
            if (!storedEmail) {
                window.location.href = "/register";
            } else {
                setEmail(storedEmail);
            }
        }
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (otp.length !== 6) {
            setError("Please enter a 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/verify-otp`, {
                email,
                otp
            });
            setSuccess("Account verified successfully! Redirecting to login...");
            localStorage.removeItem("verifyEmail");
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Verification failed. Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError("");
        setSuccess("");
        try {
            await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
            setSuccess("A new OTP has been sent to your email.");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend OTP.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 py-12 bg-slate-50 dark:bg-slate-950 font-sans selection:bg-orange-100">
            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-slate-800 text-accent rounded-2xl mb-6">
                    <ShieldCheck size={32} />
                </div>

                <h1 className="text-3xl font-black text-primary dark:text-white tracking-tight mb-2">Verify OTP</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                    We've sent a 6-digit code to <br />
                    <span className="text-primary dark:text-white font-bold">{email}</span>
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> {success}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <Input
                        type="text"
                        maxLength={6}
                        placeholder="· · · · · ·"
                        className="h-20 text-center text-4xl font-black tracking-[1em] rounded-2xl bg-slate-50 dark:bg-slate-850 border-transparent focus:border-accent focus:bg-white dark:focus:bg-slate-900 transition-all text-primary dark:text-white"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                    />

                    <Button
                        className="w-full h-14 text-lg font-bold bg-primary hover:bg-black text-white rounded-xl shadow-xl transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "VERIFY ACCOUNT"}
                    </Button>
                </form>

                <div className="mt-8">
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center justify-center gap-2 mx-auto hover:text-orange-600 transition-colors"
                    >
                        {resending ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw size={16} />}
                        RESEND OTP
                    </button>
                </div>
            </div>
        </div>
    );
}

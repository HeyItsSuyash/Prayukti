"use client";

import { API_URL } from "@/lib/config";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import axios from "axios";


export default function VerifyPage() {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedEmail = localStorage.getItem("verifyEmail");
        if (!storedEmail) {
            window.location.href = "/register";
        } else {
            setEmail(storedEmail);
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
            const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
                email,
                otp
            });

            // Save token and user so the user is automatically logged in
            if (res.data.token) {
                localStorage.setItem("vlab_token", res.data.token);
            }
            if (res.data.user) {
                localStorage.setItem("vlab_user", JSON.stringify(res.data.user));
                localStorage.setItem("studentName", res.data.user.fullName || "");
                localStorage.setItem("studentRoll", res.data.user.rollNo || "");
            }

            localStorage.removeItem("verifyEmail");
            setSuccess("Account verified! Redirecting to your dashboard...");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);
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

    if (!isMounted) return null;

    return (
        <div className="flex-1 flex items-center justify-center p-4 py-12 bg-[#021D24] font-sans selection:bg-[#14D98F]/30 min-h-screen">
            <div className="bg-[#03252E] p-8 md:p-12 rounded-none border border-[#14D98F]/20 shadow-2xl max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#084738] text-[#14D98F] rounded-none mb-6 border border-[#14D98F]/30">
                    <i className="bx bx-shieldcheck"  />
                </div>

                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Verify OTP</h1>
                <p className="text-slate-300 font-medium mb-8">
                    We've sent a 6-digit code to <br />
                    <span className="text-[#14D98F] font-bold">{email}</span>
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-none flex items-center gap-2 text-left">
                        <i className="bx bx-error-circle w-4 h-4 text-lg"  /> {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-[#14D98F]/10 border border-[#14D98F]/30 text-[#14D98F] text-xs font-bold rounded-none flex items-center gap-2 text-left">
                        <i className="bx bx-shield-check w-4 h-4 text-lg"  /> {success}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <Input
                        type="text"
                        maxLength={6}
                        placeholder="· · · · · ·"
                        className="h-20 text-center text-4xl font-black tracking-[1em] rounded-none bg-[#021D24] border border-[#14D98F]/20 focus:border-[#14D98F] focus:bg-[#021D24] transition-all text-white placeholder:text-slate-700 outline-none focus-visible:ring-0"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                    />

                    <Button
                        className="w-full h-14 text-lg font-bold bg-[#14D98F] hover:bg-[#14D98F]/90 text-[#021D24] rounded-none transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? <i className="bx bx-loader2 animate-spin"  /> : "VERIFY ACCOUNT"}
                    </Button>
                </form>

                <div className="mt-8">
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="text-slate-400 text-sm font-bold flex items-center justify-center gap-2 mx-auto hover:text-[#14D98F] transition-colors"
                    >
                        {resending ? <i className="bx bx-loader2 animate-spin w-4 h-4"  /> : <i className="bx bx-refreshcw"  />}
                        RESEND OTP
                    </button>
                </div>
            </div>
        </div>
    );
}

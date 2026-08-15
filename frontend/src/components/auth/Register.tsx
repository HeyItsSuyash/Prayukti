"use client";

import { API_URL } from "@/lib/config";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";



import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import axios from "axios";
import { z } from "zod";
import Link from 'next/link';

const step1Schema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address").endsWith("@mmmut.ac.in", "Only @mmmut.ac.in emails are allowed"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const step2Schema = z.object({
    rollNo: z.string().min(3, "Roll number is required"),
    enrollmentNo: z.string().min(3, "Enrollment number is required"),
    branch: z.string().min(2, "Branch is required")
});


const slides = [
    {
        tag: "Join the Community",
        title: "Your Journey Starts Here.",
        description: "Join over 5,000+ students already using our virtual laboratory platform to master engineering concepts.",
        testimonial: null
    },
    {
        tag: "Global Access",
        title: "Infrastructure at Scale.",
        description: "Seamlessly conduct experiments remotely with high-fidelity simulations.",
        testimonial: {
            text: "Prayukti provides a seamless way to conduct experiments remotely. It's an essential tool for modern education at MMMUT.",
            author: "Anjali Sharma",
            position: "B.Tech Final Year"
        }
    },
    {
        tag: "Expert Endorsement",
        title: "Academically Verified.",
        description: "Every module is peer-reviewed by faculty to ensure 100% curriculum alignment.",
        testimonial: {
            text: "The precision and attention to syllabus detail makes Prayukti the gold standard for virtual labs in Uttar Pradesh.",
            author: "Dr. R. P. Singh",
            position: "Head of Department, CSE"
        }
    }
];

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rollNo, setRollNo] = useState("");
    const [enrollmentNo, setEnrollmentNo] = useState("");
    const [branch, setBranch] = useState("");
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [otp, setOtp] = useState("");
    const [resending, setResending] = useState(false);
    const [verifySuccess, setVerifySuccess] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [resendTimer]);

    useEffect(() => {
        setIsMounted(true);
        const draft = localStorage.getItem("registerDraft");
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                if (parsed.fullName) setFullName(parsed.fullName);
                if (parsed.email) setEmail(parsed.email);
                if (parsed.password) setPassword(parsed.password);
                if (parsed.rollNo) setRollNo(parsed.rollNo);
                if (parsed.enrollmentNo) setEnrollmentNo(parsed.enrollmentNo);
                if (parsed.branch) setBranch(parsed.branch);
                if (parsed.year) setYear(parsed.year);
                if (parsed.semester) setSemester(parsed.semester);
                if (parsed.step) setStep(parsed.step);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            const draft = {
                fullName, email, password, rollNo, enrollmentNo, branch, year, semester, step
            };
            localStorage.setItem("registerDraft", JSON.stringify(draft));
        }
    }, [fullName, email, password, rollNo, enrollmentNo, branch, year, semester, step, isMounted]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleRegister = async () => {
        setError("");

        if (!agreeTerms) {
            setError("Please agree to the Terms & Conditions.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/register`, {
                fullName,
                email,
                password,
                rollNo,
                enrollmentNo,
                branch,
                year,
                semester,
                role: 'student'
            });

            localStorage.removeItem("registerDraft");
            setResendTimer(30);
            setStep(4);
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            nextStep();
        } else if (step === 3) {
            await handleRegister();
        } else if (step === 4) {
            await handleVerify(e);
        }
    };

    const handleVerify = async (e: React.FormEvent | React.MouseEvent) => {
        if (e && 'preventDefault' in e) e.preventDefault();
        setError("");
        setVerifySuccess("");

        if (otp.length !== 6) {
            setError("Please enter a 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
                email,
                otp
            }, { withCredentials: true });

            if (res.data.user) {
                localStorage.setItem("studentName", res.data.user.fullName || "");
                localStorage.setItem("studentRoll", res.data.user.rollNo || "");
                localStorage.setItem("vlab_user", JSON.stringify(res.data.user));
            }

            if (res.data.token) {
                localStorage.setItem("vlab_access_token", res.data.token);
                // Sync token with Next.js middleware so it is set as a first-party cookie
                await fetch('/api/auth/set-cookie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: res.data.token })
                });
            }

            setVerifySuccess("Account verified! Redirecting to your dashboard...");
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
        setVerifySuccess("");
        try {
            await axios.post(`${API_URL}/api/auth/resend-otp`, { email }, { withCredentials: true });
            setVerifySuccess("A new OTP has been sent to your email.");
            setResendTimer(30);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend OTP.");
        } finally {
            setResending(false);
        }
    };

    const nextStep = () => {
        try {
            if (step === 1) {
                step1Schema.parse({ fullName, email, password });
                setRollNo(email.split('@')[0]);
            } else if (step === 2) {
                step2Schema.parse({ rollNo, enrollmentNo, branch });
            }
            setError("");
            setStep(step + 1);
        } catch (e: any) {
            if (e instanceof z.ZodError || e.name === "ZodError") {
                const zodError = e as any;
                const message = zodError.errors?.[0]?.message || zodError.issues?.[0]?.message || "Validation failed";
                setError(message);
            } else {
                setError(e.message || "An unexpected error occurred");
            }
        }
    };

    const prevStep = () => {
        setError("");
        setStep(step - 1);
    };

    if (!isMounted) return null;

    return (
        <main className="h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* Left Column - Branding & Illustration */}
            <div className="hidden lg:flex w-1/2 bg-[#084738] relative flex-col justify-between p-12 overflow-hidden">
                {/* Background Illustration */}
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
                            Join the<br />
                            Future of Learning.
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed max-w-md">
                            Create your account to access virtual laboratories and smart analytics.
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

            {/* Right Column - Registration Form */}
            <div className="w-full lg:w-1/2 bg-[#FAFAFA] flex flex-col items-center justify-center relative p-8 sm:p-12">
                <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-10 sm:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={step === 1 ? () => window.location.href = ("/login") : prevStep}
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
                            >
                                <i className="bx bx-chevron-left text-lg"  /> {step === 1 ? "Back" : "Previous"}
                            </button>
                            <div className="flex gap-1.5 pb-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-1.5 rounded-full  duration-500 ${step >= i ? "w-6 bg-[#059669]" : "w-2 bg-slate-200"}`} />
                                ))}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            {step === 4 ? "Verification" : "Create Account"}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {step === 4 ? "Step 4 of 4 • Verify Email" : `Step ${step} of 4 • ${step === 1 ? "Account Basics" : step === 2 ? "University Details" : "Academic Info"}`}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center gap-2 animate-in fade-in">
                            <i className="bx bx-error-circle text-lg" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700 block text-left">Full Name</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                            <i className="bx bx-user text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                        </div>
                                        <Input
                                            placeholder="John Doe"
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none  text-sm text-slate-700 placeholder:text-slate-400"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700 block text-left">University Email</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                            <i className="bx bx-envelope text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                        </div>
                                        <Input
                                            type="email"
                                            placeholder="name@mmmut.ac.in"
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none  text-sm text-slate-700 placeholder:text-slate-400"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700 block text-left">Password</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                            <i className="bx bx-lock-alt text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                        </div>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none  text-sm text-slate-700 placeholder:text-slate-400"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
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
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-slate-700 block text-left">Roll No</Label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                <i className="bx bx-id-card text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                            </div>
                                            <Input
                                                placeholder="240101001"
                                                value={rollNo}
                                                disabled
                                                required
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none  text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-slate-700 block text-left">Enrollment No</Label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                <i className="bx bx-hash text-slate-400 group-focus-within:text-[#059669] text-lg transition-colors"></i>
                                            </div>
                                            <Input
                                                placeholder="2024CSE001"
                                                value={enrollmentNo}
                                                onChange={e => setEnrollmentNo(e.target.value)}
                                                required
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none  text-sm text-slate-700 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700 block text-left">Branch</Label>
                                    <Select onValueChange={v => setBranch(v)}>
                                        <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-[#059669]/10 focus:border-[#059669]  text-sm text-slate-700 shadow-none">
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.05)] text-slate-700">
                                            <SelectItem value="CSE" className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">Computer Science & Engineering</SelectItem>
                                            <SelectItem value="IT" className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">Information Technology</SelectItem>
                                            <SelectItem value="ECE" className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">Electronics & Comm. Engineering</SelectItem>
                                            <SelectItem value="EE" className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">Electrical Engineering</SelectItem>
                                            <SelectItem value="ME" className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">Mechanical Engineering</SelectItem>
                                            <SelectItem value="CE" className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">Civil Engineering</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-slate-700 block text-left">Academic Year</Label>
                                        <Select onValueChange={v => {
                                            const selectedYear = parseInt(v);
                                            setYear(selectedYear);
                                            setSemester(selectedYear * 2 - 1);
                                        }}>
                                            <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-[#059669]/10 focus:border-[#059669]  text-sm text-slate-700 shadow-none">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.05)] text-slate-700">
                                                {[1, 2, 3, 4].map(y => {
                                                    const suffix = y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th';
                                                    return <SelectItem key={y} value={y.toString()} className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">{y}{suffix} Year</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-slate-700 block text-left">Semester</Label>
                                        <Select onValueChange={v => setSemester(parseInt(v))}>
                                            <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-[#059669]/10 focus:border-[#059669]  text-sm text-slate-700 shadow-none">
                                                <SelectValue placeholder="Semester" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.05)] text-slate-700">
                                                {[year * 2 - 1, year * 2].map(s => <SelectItem key={s} value={s.toString()} className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">Sem {s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreeTerms}
                                        onChange={(e) => {
                                            setAgreeTerms(e.target.checked);
                                            if (e.target.checked && error === "Please agree to the Terms & Conditions.") {
                                                setError("");
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-[#059669] focus:ring-[#059669] accent-[#059669]  cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-sm font-medium text-slate-500 cursor-pointer">
                                        I agree to the <a href="/terms" className="text-[#059669] hover:text-[#047857] font-semibold">Terms & Conditions</a> for MMMUT Virtual Labs.
                                    </label>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                                <p className="text-sm text-slate-500 mb-6">
                                    We've sent a 6-digit code to <br />
                                    <span className="text-[#059669] font-semibold">{email}</span>
                                </p>
                                
                                {verifySuccess && (
                                    <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl flex items-center gap-2 justify-center text-left">
                                        <i className="bx bx-check-circle text-lg"  /> {verifySuccess}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <Input
                                        type="text"
                                        maxLength={6}
                                        placeholder="· · · · · ·"
                                        className="h-16 text-center text-3xl font-black tracking-[0.5em] rounded-xl bg-slate-50 border-transparent focus:border-[#059669] focus:bg-white  text-slate-800 placeholder:text-slate-300 mx-auto max-w-[240px]"
                                        value={otp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            setOtp(val);
                                            if (error) setError("");
                                        }}
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending || resendTimer > 0}
                                        className={`text-sm font-medium flex items-center justify-center gap-1.5 mx-auto mt-2 transition-colors ${resendTimer > 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-[#059669]"}`}
                                    >
                                        {resending ? <i className="bx bx-loader-alt bx-spin" /> : <i className="bx bx-refresh" />}
                                        {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 pt-4">
                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl  shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] .5 mt-2 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    Continue <i className="bx bx-right-arrow-alt ml-2 text-xl"  />
                                </button>
                            ) : step === 3 ? (
                                <button
                                    type="submit"
                                    className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl  shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] .5 mt-2 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                                    disabled={loading}
                                >
                                    {loading ? <i className="bx bx-loader-alt bx-spin text-xl"  /> : (
                                        <span className="flex items-center gap-2">Create Account <i className="bx bx-check-circle text-xl"  /></span>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleVerify}
                                    className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl  shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] .5 mt-2 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                                    disabled={loading}
                                >
                                    {loading ? <i className="bx bx-loader-alt bx-spin text-xl"  /> : (
                                        <span className="flex items-center gap-2">Verify Account <i className="bx bx-check-circle text-xl"  /></span>
                                    )}
                                </button>
                            )}

                            {step !== 4 && (
                                <p className="text-center text-sm font-medium text-slate-500">
                                    {step === 1 ? (
                                        <>Already have an account? <a href="/login" className="text-[#059669] hover:text-[#047857] transition-colors font-semibold">Sign In</a></>
                                    ) : (
                                        <>Need help? <a href="/support" className="text-[#059669] hover:text-[#047857] transition-colors font-semibold">Contact Support</a></>
                                    )}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

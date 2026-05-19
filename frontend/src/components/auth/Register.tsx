"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    Mail,
    User,
    Lock,
    ArrowRight,
    Hash,
    ChevronLeft,
    Eye,
    EyeOff,
    Quote,
    CheckCircle2,
    AlertCircle
} from "lucide-react";


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
    

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!agreeTerms) {
            setError("Please agree to the Terms & Conditions.");
            return;
        }

        const cleanEmail = email.toLowerCase().trim();
        if (!cleanEmail.endsWith("@mmmut.ac.in")) {
            setError("Only @mmmut.ac.in emails are allowed.");
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

            localStorage.setItem("verifyEmail", email);
            window.location.href = ("/verify");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && (!fullName || !email || !password)) {
            setError("Please fill in all account details.");
            return;
        }
        if (step === 1 && !email.toLowerCase().endsWith("@mmmut.ac.in")) {
            setError("Only @mmmut.ac.in emails are allowed.");
            return;
        }
        if (step === 2 && (!rollNo || !enrollmentNo || !branch)) {
            setError("Please fill in all university details.");
            return;
        }
        setError("");
        setStep(step + 1);
    };

    const prevStep = () => {
        setError("");
        setStep(step - 1);
    };

    if (!isMounted) return null;

    return (
        <div className="h-screen flex bg-white font-sans selection:bg-orange-100 overflow-hidden">
            {/* Left Sidebar - Carousel */}
            <div className="hidden lg:flex lg:w-5/12 relative bg-primary overflow-hidden h-full">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                    style={{ backgroundImage: `url('/muj_auth_sidebar_bg_1778010617249.png')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/60 to-transparent" />

                {/* Sidebar Content */}
                <div className="relative z-10 flex flex-col justify-between w-full h-full p-12">
                    <div className="flex items-center justify-between">
                        <a href="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary transform group-hover:scale-105 transition-all duration-500 shadow-xl overflow-hidden border-2 border-white/20">
                                <img
                                    src="http://www.mmmut.ac.in/images/largelogo.jpg"
                                    alt="MMMUT Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white tracking-tight leading-none">Prayukti <span className="text-accent">x MMMUT</span></span>
                                <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase mt-1">Virtual Lab System</span>
                            </div>
                        </a>

                        <a href="/" className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl transition-all border border-white/10">
                            Back to website <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* Carousel slides */}
                    <div className="relative flex-1 flex flex-col justify-center py-10">
                        {slides.map((slide, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 flex flex-col justify-center transition-all duration-1000 ${idx === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                                    }`}
                            >
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] bg-accent/10 px-3 py-1 rounded-xl border border-accent/20">{slide.tag}</span>
                                        <h2 className="text-5xl font-black text-white leading-tight">
                                            {slide.title}
                                        </h2>
                                    </div>

                                    {slide.testimonial ? (
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] space-y-4 max-w-lg shadow-2xl relative">
                                            <Quote className="absolute -top-4 -left-4 text-accent w-10 h-10 opacity-50" />
                                            <p className="text-white/90 text-xl font-medium leading-relaxed">
                                                "{slide.testimonial.text}"
                                            </p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm">{slide.testimonial.author}</div>
                                                    <div className="text-white/40 text-xs font-black uppercase tracking-widest">{slide.testimonial.position}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-white/70 max-w-sm font-medium text-lg leading-relaxed">
                                            {slide.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex gap-3">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-1.5 rounded-xl transition-all duration-500 ${idx === currentSlide ? "w-12 bg-accent shadow-[0_0_15px_rgba(243,111,33,0.5)]" : "w-4 bg-white/20 hover:bg-white/40"
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-widest">
                            <span>&copy; 2025 Madan Mohan Malaviya University of Technology</span>
                            <span>•</span>
                            <span>Gorakhpur, UP</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="max-w-xl w-full space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <button
                            onClick={step === 1 ? () => window.location.href = ("/login") : prevStep}
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors mb-4"
                        >
                            <ChevronLeft size={16} /> {step === 1 ? "Back" : "Previous Step"}
                        </button>

                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black text-primary tracking-tight">Create an account</h1>
                                <p className="text-slate-500 font-medium text-sm mt-1">
                                    Step {step} of 3 • {step === 1 ? "Account Basics" : step === 2 ? "University Details" : "Academic Info"}
                                </p>
                            </div>
                            <div className="flex gap-1.5 pb-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? "w-6 bg-accent" : "w-2 bg-slate-200"}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 text-[10px] font-black rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error.toUpperCase()}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name</Label>
                                    <div className="relative group">
                                        <Input
                                            placeholder="John Doe"
                                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all font-bold group-hover:bg-slate-100"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={20} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">University Email</Label>
                                    <div className="relative group">
                                        <Input
                                            type="email"
                                            placeholder="name@mmmut.ac.in"
                                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all font-bold group-hover:bg-slate-100"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={20} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Password</Label>
                                    <div className="relative group">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all font-bold group-hover:bg-slate-100"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={20} />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Roll No</Label>
                                        <div className="relative group">
                                            <Input
                                                placeholder="240101001"
                                                value={rollNo}
                                                onChange={e => setRollNo(e.target.value)}
                                                required
                                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all font-bold group-hover:bg-slate-100"
                                            />
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Enrollment No</Label>
                                        <div className="relative group">
                                            <Input
                                                placeholder="2024CSE001"
                                                value={enrollmentNo}
                                                onChange={e => setEnrollmentNo(e.target.value)}
                                                required
                                                className="h-14 pl-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all font-bold group-hover:bg-slate-100"
                                            />
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Branch</Label>
                                    <Select onValueChange={v => setBranch(v)}>
                                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all font-bold">
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
                                            <SelectItem value="IT">Information Technology</SelectItem>
                                            <SelectItem value="ECE">Electronics & Comm. Engineering</SelectItem>
                                            <SelectItem value="EE">Electrical Engineering</SelectItem>
                                            <SelectItem value="ME">Mechanical Engineering</SelectItem>
                                            <SelectItem value="CE">Civil Engineering</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Academic Year</Label>
                                        <Select onValueChange={v => setYear(parseInt(v))}>
                                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all font-bold">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4].map(y => <SelectItem key={y} value={y.toString()}>{y}st Year</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Semester</Label>
                                        <Select onValueChange={v => setSemester(parseInt(v))}>
                                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white transition-all font-bold">
                                                <SelectValue placeholder="Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 py-2 bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        className="w-5 h-5 rounded-md border-2 border-slate-300 text-accent focus:ring-accent transition-all cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-xs font-bold text-slate-500 cursor-pointer">
                                        I agree to the <a href="/terms" className="text-accent hover:underline">Terms & Conditions</a> for MMMUT Virtual Labs.
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            {step < 3 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full py-8 text-lg font-black tracking-widest rounded-2xl shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white transition-all active:scale-[0.98] border-0"
                                >
                                    CONTINUE <ArrowRight className="ml-2" size={20} />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="w-full py-8 text-lg font-black tracking-widest rounded-2xl shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white transition-all active:scale-[0.98] border-0"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : (
                                        <span className="flex items-center gap-2">CREATE ACCOUNT <CheckCircle2 size={20} /></span>
                                    )}
                                </Button>
                            )}

                            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                                {step === 1 ? (
                                    <>Already have an account? <a href="/login" className="text-accent hover:underline">Sign In</a></>
                                ) : (
                                    <>Need help? <a href="/support" className="text-accent hover:underline">Contact Support</a></>
                                )}
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

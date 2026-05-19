"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";


import {
    Loader2,
    GraduationCap,
    School,
    ShieldCheck,
    User,
    Lock,
    Mail,
    ArrowRight,
    ChevronLeft,
    Eye,
    EyeOff,
    Quote,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type UserRole = "student" | "teacher" | "admin";

const slides = [
    {
        tag: "Academic Excellence",
        title: "Empowering Engineers, Simulating Future.",
        description: "Experience the next generation of virtual laboratories. Access industry-standard simulations and track your academic journey.",
        testimonial: null
    },
    {
        tag: "Faculty Voice",
        title: "Precision in Every Pixel.",
        description: "Standardized modules designed to align perfectly with your university syllabus.",
        testimonial: {
            text: "The virtual labs have revolutionized my learning experience. The simulations are incredibly accurate and easy to use.",
            author: "Dr. S. K. Singh",
            position: "Professor, IT Dept"
        }
    },
    {
        tag: "Student Impact",
        title: "Learn Anywhere, Anytime.",
        description: "Join over 5,000+ students mastering engineering concepts from the comfort of their homes.",
        testimonial: {
            text: "Prayukti provides a seamless way to conduct experiments remotely. It's an essential tool for modern education at MMMUT.",
            author: "Anjali Sharma",
            position: "B.Tech Final Year"
        }
    }
];

export default function LoginPage() {
    const [role, setRole] = useState<UserRole>("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    

    useEffect(() => {
        setError("");
        setSuccess(false);
    }, [role, email, password]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = '/api/auth/login';
            const response = await axios.post(`${API_URL}${endpoint}`, {
                email,
                password
            });

            const { token, user } = response.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem("vlab_token", token);
                localStorage.setItem("vlab_user", JSON.stringify(user));
                localStorage.setItem("studentName", user.fullName);
                localStorage.setItem("studentRoll", user.rollNo || "");
            }

            setSuccess(true);
            setTimeout(() => {
                if (role === 'teacher') window.location.href = ("/dashboard/teacher");
                else if (role === 'admin') window.location.href = ("/dashboard/admin");
                else window.location.href = ("/dashboard");
            }, 1500);

        } catch (err: any) {
            const message = err.response?.data?.message || "Login failed";
            setError(message);

            if (message === "Your account is not verified" && role === 'student') {
                localStorage.setItem("verifyEmail", email);
                window.location.href = ("/verify");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTestLogin = async (targetRole: UserRole) => {
        try {
            setError("");
            setLoading(true);

            const testEmail = targetRole === 'student' ? "test.student@mmmut.ac.in" :
                targetRole === 'teacher' ? "test.faculty@mmmut.ac.in" :
                    "test.admin@mmmut.ac.in";

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmail,
                    password: 'password123'
                })
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('vlab_token', data.token);
                localStorage.setItem('vlab_user', JSON.stringify(data.user));
                if (targetRole === 'student') {
                    localStorage.setItem('studentName', data.user?.fullName || '');
                    localStorage.setItem('studentRoll', data.user?.rollNo || '');
                }
                setSuccess(true);
                setTimeout(() => {
                    if (targetRole === 'teacher') window.location.href = ('/dashboard/teacher');
                    else if (targetRole === 'admin') window.location.href = ('/dashboard/admin');
                    else window.location.href = ('/dashboard');
                }, 1000);
            } else {
                setError(data.message || 'Test login failed');
            }
        } catch (err: any) {
            setError('Test login error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex bg-white font-sans selection:bg-orange-100 overflow-hidden">
            {/* Left Sidebar - Carousel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-stretch">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                    style={{ backgroundImage: `url('/muj_auth_sidebar_bg_1778010617249.png')` }}
                />
                <div className="absolute inset-0 bg-primary/80" />

                {/* Sidebar Content */}
                <div className="relative z-10 flex flex-col justify-between w-full p-12">
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
                                        <p className="text-white/70 max-w-md font-medium text-lg leading-relaxed">
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
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-20">
                <div className="max-w-md w-full space-y-10">
                    {/* Header */}
                    <div className="space-y-4">
                        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors mb-4">
                            <ChevronLeft size={16} /> Back
                        </a>
                        <h1 className="text-4xl font-black text-primary tracking-tight">Sign in to your account</h1>

                    </div>

                    {/* Role Selection */}
                    <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                        {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${role === r
                                    ? 'bg-white text-primary shadow-lg ring-1 ring-black/5'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {r === 'student' ? <GraduationCap size={14} /> : r === 'teacher' ? <School size={14} /> : <ShieldCheck size={14} />}
                                    {r}
                                </div>
                            </button>
                        ))}
                    </div>

                    {success ? (
                        <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-green-100 transform rotate-12">
                                <CheckCircle2 size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-primary tracking-tight">Access Granted</h3>
                                <p className="text-slate-500 font-medium">Secure session initialized. Redirecting...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">University Email</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@mmmut.ac.in"
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl outline-none transition-all text-slate-700 font-bold pl-12 group-hover:bg-slate-100"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end pr-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                                    <button type="button" className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">Forgot password?</button>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl outline-none transition-all text-slate-700 font-bold pl-12 group-hover:bg-slate-100"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 text-[10px] font-black rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error.toUpperCase()}
                                </div>
                            )}

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-8 text-lg font-black tracking-widest rounded-2xl shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white transition-all active:scale-[0.98] border-0"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "SIGN IN"}
                                </Button>

                                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Don't have an account? <a href="/register" className="text-accent hover:underline">Register Now</a>
                                </p>
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                                    <span className="bg-white px-4 text-slate-400">Quick Dev Access</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-14 rounded-2xl font-bold gap-3 border-2 border-slate-100 hover:bg-slate-50 transition-all text-slate-500 uppercase tracking-widest text-[10px]"
                                    onClick={() => handleTestLogin(role)}
                                >
                                    <CheckCircle2 size={18} className="text-green-500" />
                                    Bypass Authentication ({role})
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

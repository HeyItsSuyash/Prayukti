"use client";

import { API_URL } from "@/lib/config";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";


import axios from "axios";


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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
            }, { withCredentials: true });

            const { token, user } = response.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem("studentName", user.fullName);
                localStorage.setItem("studentRoll", user.rollNo || "");
            }

            // Sync token with Next.js middleware
            await fetch('/api/auth/set-cookie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            setSuccess(true);
                setTimeout(() => {
                    window.location.href = ("/dashboard");
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
                credentials: 'include',
                body: JSON.stringify({
                    email: testEmail,
                    password: 'password123'
                })
            });
            const data = await response.json();
            if (data.token) {
                if (targetRole === 'student') {
                    localStorage.setItem('studentName', data.user?.fullName || '');
                    localStorage.setItem('studentRoll', data.user?.rollNo || '');
                }
                
                // Sync token with Next.js middleware
                await fetch('/api/auth/set-cookie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: data.token })
                });

                setSuccess(true);
                setTimeout(() => {
                    window.location.href = ('/dashboard');
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

    if (!mounted) {
        return (
            <div className="h-screen flex bg-white font-sans items-center justify-center">
                <i className="bx bx-loader2 animate-spin text-[#059669] w-10 h-10"  />
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-background font-sans selection:bg-primary/20 overflow-hidden">
            {/* Left Sidebar - Carousel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-secondary overflow-hidden items-stretch">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center  duration-1000"
                    style={{ backgroundImage: `url('/muj_auth_sidebar_bg_1778010617249.png')` }}
                />
                <div className="absolute inset-0 bg-secondary/80" />

                {/* Sidebar Content */}
                <div className="relative z-10 flex flex-col justify-between w-full p-12">
                    <div className="flex items-center justify-between">
                        <a href="/" className="flex items-center gap-3 group">
                            <div className="w-16 h-16 flex items-center justify-center transform group-  duration-500">
                                <img
                                    src="/prayukti 2.0/logo/logo_blue.png"
                                    alt="Prayukti Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white tracking-tight leading-none">Prayukti</span>
                                <span className="text-xs font-medium text-white/80 mt-1">Virtual Lab System</span>
                            </div>
                        </a>

                        <a href="/" className="flex items-center gap-2 text-white/80 hover:text-white font-medium text-sm bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-sm  border border-white/10 hover:bg-white/20">
                            Back to website <i className="bx bx-right-arrow-alt"  />
                        </a>
                    </div>

                    {/* Carousel slides */}
                    <div className="relative flex-1 flex flex-col justify-center py-10">
                        {slides.map((slide, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 flex flex-col justify-center  duration-1000 ${idx === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                                    }`}
                            >
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <span className="text-primary-foreground font-semibold text-xs bg-primary/20 px-3 py-1 rounded-full border border-primary/30">{slide.tag}</span>
                                        <h2 className="text-4xl font-bold text-white leading-tight">
                                            {slide.title}
                                        </h2>
                                    </div>

                                    {slide.testimonial ? (
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-md space-y-4 max-w-lg  relative">
                                            <i className="bx bxs-quote-alt-left absolute -top-4 -left-4 text-primary-foreground w-10 h-10 opacity-50"  />
                                            <p className="text-white/90 text-lg font-medium leading-relaxed">
                                                "{slide.testimonial.text}"
                                            </p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary-foreground">
                                                    <i className="bx bx-user"  />
                                                </div>
                                                <div>
                                                    <div className="text-white font-semibold text-sm">{slide.testimonial.author}</div>
                                                    <div className="text-white/60 text-xs font-medium">{slide.testimonial.position}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-white/80 max-w-md font-medium text-lg leading-relaxed">
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
                                    className={`h-1.5 rounded-full  duration-500 ${idx === currentSlide ? "w-8 bg-primary " : "w-2 bg-white/20 hover:bg-white/40"
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-3 text-white/60 text-xs font-medium">
                            <span>&copy; 2025 Madan Mohan Malaviya University of Technology</span>
                            <span>•</span>
                            <span>Gorakhpur, UP</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-20">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                        <a href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors mb-4">
                            <i className="bx bx-chevron-left"  /> Back
                        </a>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Sign in to your account</h1>
                    </div>

                    {/* Role Selection */}
                    <div className="flex p-1.5 bg-muted rounded-md gap-1">
                        {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`flex-1 py-2.5 text-sm font-medium capitalize rounded-sm  ${role === r
                                    ? 'bg-background text-foreground '
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {r === 'student' ? <i className="bx bxs-graduation"  /> : r === 'teacher' ? <i className="bx bx-school"  /> : <i className="bx bx-shieldcheck"  />}
                                    {r}
                                </div>
                            </button>
                        ))}
                    </div>

                    {success ? (
                        <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto ">
                                <i className="bx bx-check-circle"  />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-foreground tracking-tight">Access Granted</h3>
                                <p className="text-muted-foreground font-medium">Secure session initialized. Redirecting...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">University Email</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@mmmut.ac.in"
                                        className="w-full px-4 py-3 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-sm outline-none  text-foreground text-sm pl-11 "
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <i className="bx bx-envelope absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"  />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-foreground">Password</label>
                                    <button type="button" className="text-sm font-medium text-primary hover:underline">Forgot password?</button>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-sm outline-none  text-foreground text-sm pl-11 "
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <i className="bx bx-lock absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"  />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <i className="bx bx-eyeoff"  /> : <i className="bx bx-eye"  />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <i className="bx bx-alertcircle w-4 h-4 shrink-0"  />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4 pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-6 text-base font-semibold rounded-sm  "
                                >
                                    {loading ? <i className="bx bx-loader2 animate-spin w-5 h-5"  /> : "Sign In"}
                                </Button>

                                <p className="text-center text-sm font-medium text-muted-foreground">
                                    Don't have an account? <a href="/register" className="text-primary hover:underline font-semibold">Register Now</a>
                                </p>
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-xs font-medium text-muted-foreground">
                                    <span className="bg-background px-4">Quick Dev Access</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-12 rounded-sm font-medium gap-2 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleTestLogin(role)}
                                >
                                    <i className="bx bx-check-circle text-success"  />
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

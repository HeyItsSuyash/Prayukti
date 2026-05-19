"use client";
import React, { useState, useEffect } from "react";

import { Menu, X, Command, ChevronRight, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar({ pathname = "/" }: { pathname?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }

        // Check if user is logged in
        setIsLoggedIn(!!localStorage.getItem('vlab_token'));

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('vlab_token');
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/logout`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('[LOGOUT] attendance recorded');
        } catch (err) {
            console.error('[LOGOUT] attendance API failed:', err);
        } finally {
            localStorage.removeItem('vlab_token');
            localStorage.removeItem('vlab_user');
            window.location.href = '/login';
        }
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Features", href: "/features" },
        { name: "Labs", href: "/labs" },
        { name: "Explore", href: "/explore" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "bg-white/90 backdrop-blur-md border-b border-border shadow-sm py-3"
                    : "bg-white border-b border-border py-4"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo Section */}
                <a href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-primary transform group-hover:scale-105 transition-all duration-500 shadow-sm overflow-hidden border border-slate-100">
                        <img
                            src="http://www.mmmut.ac.in/images/largelogo.jpg"
                            alt="MMMUT Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-primary leading-none tracking-tight">Prayukti <span className="text-accent">x MMMUT</span></span>
                        <span className="text-[10px] font-bold text-accent leading-none tracking-wide mt-1">An initiative by the CSIS Society</span>
                    </div>
                </a>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-widest transition-all relative py-2 group",
                                    isActive
                                        ? "text-accent"
                                        : "text-slate-500 hover:text-primary"
                                )}
                            >
                                {link.name}
                                {!isActive && (
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                                )}
                            </a>
                        );
                    })}
                </nav>

                {/* Desktop CTA & Controls */}
                <div className="hidden md:flex items-center gap-6">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl text-slate-500 hover:text-primary transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {isLoggedIn && pathname !== "/" ? (
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold uppercase tracking-widest text-[11px] h-10 px-5 rounded-xl"
                        >
                            <LogOut size={15} />
                            Logout
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <a href="/explore">
                                <Button variant="outline" className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-xs">
                                    Explore
                                </Button>
                            </a>
                            <a href="/login">
                                <Button className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-xs shadow-md border border-transparent bg-accent hover:bg-accent/90 text-white">
                                    Log In
                                </Button>
                            </a>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 lg:hidden">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl text-slate-500"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <div className={cn("w-6 h-0.5 bg-primary transition-all", isMobileMenuOpen && "rotate-45 translate-y-2")} />
                        <div className={cn("w-6 h-0.5 bg-primary transition-all", isMobileMenuOpen && "opacity-0")} />
                        <div className={cn("w-6 h-0.5 bg-primary transition-all", isMobileMenuOpen && "-rotate-45 -translate-y-2")} />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-border bg-white p-6 absolute top-full left-0 w-full shadow-xl animate-in slide-in-from-top-2 duration-300">
                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-lg font-bold text-primary hover:text-accent transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="h-px bg-border my-4" />
                        {isLoggedIn && pathname !== "/" ? (
                            <Button
                                variant="outline"
                                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                className="w-full h-12 rounded-lg font-bold uppercase tracking-widest text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Logout
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <a href="/explore" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full h-12 rounded-lg font-bold uppercase tracking-widest">
                                        Explore
                                    </Button>
                                </a>
                                <a href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full h-12 rounded-lg font-bold uppercase tracking-widest bg-accent hover:bg-accent/90 text-white border-0">
                                        Log In
                                    </Button>
                                </a>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}

export default Navbar;

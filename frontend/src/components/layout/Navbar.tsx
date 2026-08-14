"use client";

import { API_URL } from "@/lib/config";
import React, { useState, useEffect } from "react";

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
        setIsLoggedIn(true /* assume auth handled by cookie */);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const handleLogout = async () => {
        try {
            
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/logout`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('[LOGOUT] attendance recorded');
        } catch (err) {
            console.error('[LOGOUT] attendance API failed:', err);
        } finally {
            
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
                "fixed top-0 z-50 w-full  duration-300",
                scrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-border  py-3"
                    : "bg-background border-b border-border py-4"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo Section */}
                <a href="/" className="flex items-center gap-3 group">
                    <div className="w-14 h-14 flex items-center justify-center transform group-  duration-500">
                        <img
                            src="/prayukti 2.0/logo/logo_blue.png"
                            alt="Prayukti Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-xl font-bold text-primary leading-none tracking-tight lowercase">prayukti</span>
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
                                    "text-sm font-medium  relative py-2 group",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {link.name}
                                {!isActive && (
                                    <span className="absolute bottom-0 left-0 w-0 h-px bg-primary  duration-300 group-hover:w-full" />
                                )}
                            </a>
                        );
                    })}
                </nav>

                {/* Desktop CTA & Controls */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        aria-label="Toggle dark mode"
                        suppressHydrationWarning
                    >
                        {isDarkMode ? <i className="bx bx-sun text-xl" /> : <i className="bx bx-moon text-xl" />}
                    </button>

                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <a href="/dashboard">
                                <Button variant="outline">
                                    Dashboard
                                </Button>
                            </a>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                            >
                                <i className="bx bx-log-out text-lg mr-2" />
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <a href="/explore">
                                <Button variant="outline" suppressHydrationWarning>
                                    Explore
                                </Button>
                            </a>
                            <a href="/login">
                                <Button suppressHydrationWarning>
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
                        className="p-2 rounded-sm text-muted-foreground"
                    >
                        {isDarkMode ? <i className="bx bx-sun text-xl" /> : <i className="bx bx-moon text-xl" />}
                    </button>
                    <button
                        className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <div className={cn("w-6 h-0.5 bg-foreground ", isMobileMenuOpen && "rotate-45 translate-y-2")} />
                        <div className={cn("w-6 h-0.5 bg-foreground ", isMobileMenuOpen && "opacity-0")} />
                        <div className={cn("w-6 h-0.5 bg-foreground ", isMobileMenuOpen && "-rotate-45 -translate-y-2")} />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-border bg-background p-6 absolute top-full left-0 w-full  animate-in slide-in-from-top-2 duration-300">
                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="h-px bg-border my-4" />
                        {isLoggedIn ? (
                            <div className="flex flex-col gap-3">
                                <a href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">
                                        Dashboard
                                    </Button>
                                </a>
                                <Button
                                    variant="destructive"
                                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                    className="w-full"
                                >
                                    <i className="bx bx-log-out text-lg mr-2" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <a href="/explore" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">
                                        Explore
                                    </Button>
                                </a>
                                <a href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full">
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

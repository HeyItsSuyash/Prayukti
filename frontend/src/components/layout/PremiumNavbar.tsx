'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarProps {
    pathname: string;
}

export function PremiumNavbar({ pathname }: NavbarProps) {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('vlab_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    const handleLogout = async () => {
        
        localStorage.removeItem('vlab_user'); await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {});
        window.location.href = '/login';
    };

    const isLander = pathname === '/';
    const isDashboard = pathname.startsWith('/dashboard') || !!user;

    const navLinks = isDashboard ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Labs", href: "/labs" },
        { label: "Smart Classes", href: "/coming-soon?feature=Smart%20Classes" },
        { label: "AI Tutor", href: "/coming-soon?feature=AI%20Tutor" }
    ] : [
        { label: "Home", href: "/" },
        { label: "Labs", href: "/labs" },
        { label: "Features", href: "/features" },
        { label: "For Educators", href: "/educators" },
        { label: "About Us", href: "/coming-soon?feature=About%20Us" },
        { label: "Contact", href: "/coming-soon?feature=Contact" },
    ];

    const headerClass = !isLander 
        ? "fixed top-0 left-0 right-0 z-50 bg-[#021D24]/95 dark:bg-background/95 backdrop-blur-md  py-4 border-b border-white/5 dark:border-white/10  duration-300"
        : cn("fixed top-0 left-0 right-0 z-50  duration-300", isScrolled ? "bg-[#021D24]/95 dark:bg-background/95 backdrop-blur-md  py-4 border-b border-white/5 dark:border-white/10" : "bg-transparent py-6");

    const textClass = "text-white/80 hover:text-white";
    const activeTextClass = "text-[#14D98F] border-[#14D98F]";
    const logoClass = "w-full h-full object-contain brightness-0 invert scale-110";
    const logoTextClass = "text-white";
    const logoSubTextClass = "text-white/70";

    return (
        <header className={headerClass}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                {/* Logo */}
                <Link href={isDashboard ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <img
                            src="/prayukti 2.0/logo/logo_blue.png"
                            alt="Prayukti Logo"
                            className={logoClass}
                        />
                    </div>
                    <div className="flex items-center">
                        <span className={cn("text-xl font-bold leading-none tracking-tight", logoTextClass)}>Prayukti</span>
                        <span className={cn("text-xl font-light leading-none ml-1", logoSubTextClass)}>vLAB</span>
                    </div>
                </Link>

                {/* Links */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link, idx) => (
                        <Link 
                            key={idx} 
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors",
                                pathname === link.href ? cn(activeTextClass, "border-b-2 pb-1 -mb-1") : textClass
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* CTAs */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                                <div className="hidden md:flex items-center">
                                    <p className="text-sm font-semibold text-white">{user.fullName}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-white/20 shadow-sm overflow-hidden bg-slate-800">
                                    <img src="/prayukti 2.0/illustrations/avatar.avif" alt="User Avatar" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-[#021D24] dark:bg-background border border-white/10 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.2)] py-2 top-full z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Top Arrow */}
                                    <div className="absolute top-0 right-4 -mt-2 w-4 h-4 bg-[#021D24] dark:bg-background border-t border-l border-white/10 dark:border-white/10 rotate-45 rounded-tl-sm z-[-1]"></div>
                                    
                                    <Link href="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors"><i className="bx bx-user mr-2 text-[#059669]"></i>Profile</Link>
                                    <Link href="/leaderboards" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors"><i className="bx bx-trophy mr-2 text-[#059669]"></i>Leaderboards</Link>
                                    <Link href="/settings" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors"><i className="bx bx-cog mr-2 text-[#059669]"></i>Settings</Link>
                                    <div className="h-px bg-white/10 my-1 mx-2"></div>
                                    <button onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"><i className="bx bx-log-out mr-2"></i>Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="outline" className="hidden md:flex rounded-xl h-10 px-6 border-white/30 text-white hover:bg-white/10 bg-transparent">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-semibold h-10 px-6 shadow-[0_4px_14px_0_rgba(5,150,105,0.39)]">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

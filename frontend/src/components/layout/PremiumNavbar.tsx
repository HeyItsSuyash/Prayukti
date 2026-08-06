'use client';

import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem('vlab_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        };
        
        loadUser();
        
        // Listen to storage events to update user profile in real-time
        window.addEventListener('storage', loadUser);
        return () => window.removeEventListener('storage', loadUser);
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    const handleLogout = () => {
        localStorage.removeItem('vlab_token');
        localStorage.removeItem('vlab_user');
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
        ? "fixed top-0 left-0 right-0 z-50 bg-[#021D24]/95 backdrop-blur-md shadow-lg py-4 border-b border-white/5 transition-all duration-300"
        : cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", isScrolled ? "bg-[#021D24]/95 backdrop-blur-md shadow-lg py-4 border-b border-white/5" : "bg-transparent py-6");

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
                        <div className="relative group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex flex-col items-end">
                                    <p className="text-sm font-semibold text-white">{user.fullName}</p>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">{user.role}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold text-lg border border-[#059669]/20 shadow-sm">
                                    {user.fullName?.charAt(0) || 'U'}
                                </div>
                            </div>
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
                                <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#059669] transition-colors"><i className="bx bx-user mr-2"></i>Profile</Link>
                                <Link href="/leaderboards" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#059669] transition-colors"><i className="bx bx-trophy mr-2"></i>Leaderboards</Link>
                                <Link href="/settings" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#059669] transition-colors"><i className="bx bx-cog mr-2"></i>Settings</Link>
                                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"><i className="bx bx-log-out mr-2"></i>Logout</button>
                            </div>
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

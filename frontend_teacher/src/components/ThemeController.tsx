"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ThemeController() {
    const pathname = usePathname();

    useEffect(() => {
        const isAuthOrLander = 
            pathname === "/" ||
            pathname.startsWith("/login") ||
            pathname.startsWith("/register") ||
            pathname.startsWith("/forgot-password") ||
            pathname.startsWith("/verify");

        if (isAuthOrLander) {
            document.documentElement.classList.remove('dark');
        } else {
            try {
                let isDark = true;
                const prefs = localStorage.getItem('vlab_settings');
                if (prefs) {
                    const parsed = JSON.parse(prefs);
                    if (parsed.darkMode !== undefined) {
                        isDark = parsed.darkMode;
                    }
                }
                if (isDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {}
        }
    }, [pathname]);

    return null;
}

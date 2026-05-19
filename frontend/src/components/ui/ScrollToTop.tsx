"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToTop}
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-white shadow-2xl shadow-primary/20 hover:bg-accent transition-all group border-0"
                        aria-label="Scroll to top"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Scroll to Top</span>
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-accent transition-all">
                            <ArrowUp className="w-3.5 h-3.5" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

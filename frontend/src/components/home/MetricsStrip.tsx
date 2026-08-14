'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number, suffix?: string, duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!isInView) return;
        
        let startTime: number;
        let animationFrame: number;
        
        const update = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            if (progress < duration) {
                // Easing function for smoother animation (easeOutExpo)
                const easing = progress === duration ? 1 : 1 - Math.pow(2, -10 * progress / duration);
                setCount(Math.floor(easing * end));
                animationFrame = requestAnimationFrame(update);
            } else {
                setCount(end);
            }
        };
        
        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isInView]);
    
    // Format with commas for thousands
    const formatted = count.toLocaleString();
    
    return <span ref={ref}>{formatted}{suffix}</span>;
}

export function MetricsStrip() {
    const [metricsData, setMetricsData] = useState({
        siteViews: 0,
        clicks: 0,
        loggedInAccounts: 0,
        experimentsMade: 0
    });
    
    useEffect(() => {
        // Fetch the metrics from our Next.js API Route which aggregates Vercel + Backend data
        fetch('/api/metrics')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setMetricsData({
                        siteViews: data.siteViews || 0,
                        clicks: data.clicks || 0,
                        loggedInAccounts: data.loggedInAccounts || 0,
                        experimentsMade: data.experimentsMade || 0
                    });
                }
            })
            .catch(err => console.error("Error fetching metrics:", err));
    }, []);

    const metrics = [
        { value: metricsData.siteViews, suffix: "+", label: "Site Views" },
        { value: metricsData.clicks, suffix: "+", label: "Clicks" },
        { value: metricsData.loggedInAccounts, suffix: "", label: "Logged In Accounts" },
        { value: metricsData.experimentsMade, suffix: "+", label: "Experiments Made" }
    ];

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#021D24] rounded-2xl py-12 px-8 flex flex-col md:flex-row items-center justify-around gap-8 "
                >
                    {metrics.map((metric, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                            <h3 className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">
                                <AnimatedCounter end={metric.value} suffix={metric.suffix} />
                            </h3>
                            <p className="text-white/80 font-medium text-sm tracking-wide">
                                {metric.label}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

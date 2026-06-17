"use client";

import React, { useEffect, useRef, useState } from "react";

interface MermaidViewerProps {
    chart: string;
}

export default function MermaidViewer({ chart }: MermaidViewerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const renderChart = async () => {
            if (!chart || !containerRef.current) return;
            try {
                // Dynamically import mermaid to prevent Next.js SSR build errors
                const mermaid = (await import("mermaid")).default;
                
                mermaid.initialize({
                    startOnLoad: false,
                    theme: "dark",
                    securityLevel: "loose",
                    fontFamily: "var(--font-sans)",
                });

                const id = `mermaid-chart-${Math.floor(Math.random() * 100000)}`;
                const { svg: renderedSvg } = await mermaid.render(id, chart);

                if (isMounted) {
                    setSvg(renderedSvg);
                    setError(null);
                }
            } catch (err: any) {
                console.error("Mermaid rendering failed:", err);
                if (isMounted) {
                    setError("Failed to render logic gate flow chart.");
                }
            }
        };

        renderChart();

        return () => {
            isMounted = false;
        };
    }, [chart]);

    if (error) {
        return (
            <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-xl text-center text-xs text-red-500 font-semibold select-none">
                {error}
                <pre className="text-[10px] text-slate-500 font-mono mt-2 text-left bg-slate-950 p-3 rounded-lg overflow-x-auto">
                    {chart}
                </pre>
            </div>
        );
    }

    return (
        <div className="w-full flex items-center justify-center p-4 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm rounded-3xl overflow-x-auto shadow-inner min-h-[200px]">
            <div 
                ref={containerRef} 
                className="mermaid w-full max-w-lg flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svg || '<div class="animate-pulse flex items-center gap-2 text-xs text-slate-400 font-bold">Compiling diagram nodes...</div>' }}
            />
        </div>
    );
}

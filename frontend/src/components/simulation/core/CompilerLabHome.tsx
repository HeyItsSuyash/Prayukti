"use client";

import React from "react";
import Link from "next/link";
import type { LabExperiment } from "@/data/cLab";

interface CompilerLabHomeProps {
    labSlug: string;          // e.g. "c", "java", "python", "dsa"
    labTitle: string;         // e.g. "C Programming Lab"
    labDescription: string;
    experiments: LabExperiment[];
    language: string;         // e.g. "c", "java", "python", "cpp"
    icon: string;             // boxicons class e.g. "bx bxl-c-plus-plus"
    accentColor?: string;     // Tailwind color class e.g. "from-blue-600"
}

const difficultyConfig = {
    Easy: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    Medium: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    Hard: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
};

export default function CompilerLabHome({
    labSlug,
    labTitle,
    labDescription,
    experiments,
    language,
    icon,
    accentColor = "from-emerald-600",
}: CompilerLabHomeProps) {
    const experimentPath = (exp: LabExperiment) =>
        `/labs/${labSlug}/${labSlug}/${labSlug}-exp-${exp.id}`;

    const easyCount = experiments.filter(e => e.difficulty === "Easy").length;
    const mediumCount = experiments.filter(e => e.difficulty === "Medium").length;
    const hardCount = experiments.filter(e => e.difficulty === "Hard").length;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Banner */}
            <div className={`w-full bg-gradient-to-br ${accentColor} to-background border-b border-border relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-8 text-[120px] font-black text-white/20 select-none leading-none">{`</>`}</div>
                </div>
                <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <i className={`${icon} text-2xl text-white`} />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-black uppercase tracking-widest">Virtual Lab</p>
                            <h1 className="text-2xl font-black text-white tracking-tight">{labTitle}</h1>
                        </div>
                    </div>
                    <p className="text-white/70 text-sm max-w-xl leading-relaxed mb-6">{labDescription}</p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="px-3 py-1.5 bg-white/10 rounded-full border border-white/20 flex items-center gap-2">
                            <i className="bx bx-book-open text-white/80 text-sm" />
                            <span className="text-white/80 text-xs font-bold">{experiments.length} Experiments</span>
                        </div>
                        {easyCount > 0 && (
                            <div className="px-3 py-1.5 bg-emerald-400/20 rounded-full border border-emerald-400/30 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-emerald-300 text-xs font-bold">{easyCount} Easy</span>
                            </div>
                        )}
                        {mediumCount > 0 && (
                            <div className="px-3 py-1.5 bg-amber-400/20 rounded-full border border-amber-400/30 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span className="text-amber-300 text-xs font-bold">{mediumCount} Medium</span>
                            </div>
                        )}
                        {hardCount > 0 && (
                            <div className="px-3 py-1.5 bg-red-400/20 rounded-full border border-red-400/30 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span className="text-red-300 text-xs font-bold">{hardCount} Hard</span>
                            </div>
                        )}
                        <div className="px-3 py-1.5 bg-white/10 rounded-full border border-white/20 flex items-center gap-2">
                            <i className="bx bx-code-alt text-white/80 text-sm" />
                            <span className="text-white/80 text-xs font-bold uppercase">{language}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Experiments Grid */}
            <div className="max-w-6xl mx-auto px-8 py-10">
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">
                    All Experiments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {experiments.map((exp) => {
                        const diff = difficultyConfig[exp.difficulty] ?? difficultyConfig.Easy;
                        return (
                            <Link
                                key={exp.id}
                                href={experimentPath(exp)}
                                className="group relative flex flex-col bg-card border border-border hover:border-primary/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                            >
                                {/* Exp number */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Exp {String(exp.id).padStart(2, "0")}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${diff.bg} ${diff.color} ${diff.border}`}>
                                        {exp.difficulty}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                                    {exp.title}
                                </h3>

                                {/* Description */}
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                                    {exp.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                    <div className="flex items-center gap-1.5">
                                        <i className="bx bx-code-block text-muted-foreground text-xs" />
                                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">{exp.language ?? language}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                                        Open <i className="bx bx-right-arrow-alt" />
                                    </div>
                                </div>

                                {/* Hover accent line */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

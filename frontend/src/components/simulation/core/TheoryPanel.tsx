"use client";

import React from "react";
import { BookOpen, Info, Clock, Layers, Zap, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TheoryPanelProps {
    experiment: any;
}

export const TheoryPanel: React.FC<TheoryPanelProps> = ({ experiment }) => {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-muted/30">
            {/* Concept Overview */}
            <section className="space-y-4">
<<<<<<< Updated upstream
                <div className="flex items-center gap-2 text-blue-600">
                    <BookOpen className="h-4 w-4" />
=======
                <div className="flex items-center gap-2 text-primary">
                    <i className="bx bx-bookopen h-4 w-4"  />
>>>>>>> Stashed changes
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Concept Overview</h2>
                </div>
                <div className="prose prose-sm prose-slate max-w-none">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">Introduction</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {experiment.concept || experiment.theory || "Theoretical foundations are being finalized for this experiment."}
                    </p>
                </div>
            </section>

            {/* Procedural Logic / Algorithm */}
            <section className="space-y-4">
<<<<<<< Updated upstream
                <div className="flex items-center gap-2 text-blue-600">
                    <Layers className="h-4 w-4" />
=======
                <div className="flex items-center gap-2 text-primary">
                    <i className="bx bx-layers h-4 w-4"  />
>>>>>>> Stashed changes
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Procedural Logic</h2>
                </div>
                <div className="space-y-3">
                    {Array.isArray(experiment.algorithm) ? (
                        experiment.algorithm.map((step: string, i: number) => (
                            <div key={i} className="flex gap-4 p-3 bg-card border border-border rounded shadow-sm hover:border-primary/40 transition-colors group">
                                <div className="h-6 w-6 shrink-0 bg-primary text-primary-foreground rounded flex items-center justify-center font-black text-[10px] shadow-lg shadow-primary/20">
                                    {i + 1}
                                </div>
                                <p className="text-xs font-semibold text-card-foreground leading-normal">{step}</p>
                            </div>
                        ))
                    ) : (
                        <div className="bg-card p-4 rounded font-mono text-[11px] whitespace-pre-wrap border border-border text-muted-foreground italic">
                            {experiment.algorithm || "Step-by-step logic is being documented."}
                        </div>
                    )}
                </div>
            </section>

            {/* Complexity Analysis */}
            <section className="space-y-4">
<<<<<<< Updated upstream
                <div className="flex items-center gap-2 text-blue-600">
                    <Zap className="h-4 w-4" />
=======
                <div className="flex items-center gap-2 text-primary">
                    <i className="bx bx-zap h-4 w-4"  />
>>>>>>> Stashed changes
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Complexity Analysis</h2>
                </div>
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col p-3 bg-card border border-border rounded">
                            <span className="text-[8px] font-black text-muted-foreground uppercase mb-1">Worst Case</span>
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-mono text-[10px] w-fit">
                                {experiment.worstCase || "O(N²)"}
                            </Badge>
                        </div>
                        <div className="flex flex-col p-3 bg-card border border-border rounded">
                            <span className="text-[8px] font-black text-muted-foreground uppercase mb-1">Average Case</span>
                            <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] w-fit">
                                {experiment.averageCase || "O(N log N)"}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card border border-border rounded">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Space Complexity</span>
                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 font-mono text-[10px]">
                            {experiment.spaceComplexity || "O(N)"}
                        </Badge>
                    </div>
                </div>
            </section>

            {/* Real-world Applications */}
            <section className="space-y-4">
<<<<<<< Updated upstream
                <div className="flex items-center gap-2 text-blue-600">
                    <Globe className="h-4 w-4" />
=======
                <div className="flex items-center gap-2 text-primary">
                    <i className="bx bx-globe h-4 w-4"  />
>>>>>>> Stashed changes
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Real-world Applications</h2>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded p-4 text-card-foreground text-xs leading-relaxed italic">
                    {experiment.applications || "This algorithm is fundamental in optimizing search operations and managing structured data in large-scale system architectures."}
                </div>
            </section>

            {/* Dry Run Table */}
            {experiment.dryRun && (
                <section className="space-y-4">
<<<<<<< Updated upstream
                    <div className="flex items-center gap-2 text-blue-600">
                        <Clock className="h-4 w-4" />
=======
                    <div className="flex items-center gap-2 text-primary">
                        <i className="bx bx-clock h-4 w-4"  />
>>>>>>> Stashed changes
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Dry Run Trace</h2>
                    </div>
                    <div className="overflow-hidden border border-border rounded bg-card shadow-sm font-mono text-[10px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="p-2 font-black text-foreground">Step</th>
                                    <th className="p-2 font-black text-foreground">Variables</th>
                                    <th className="p-2 font-black text-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {experiment.dryRun.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-primary/5 transition-colors">
                                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                                        <td className="p-2 text-primary font-bold">{row.vars}</td>
                                        <td className="p-2 text-muted-foreground">{row.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

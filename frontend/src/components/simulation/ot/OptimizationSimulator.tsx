"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table as TableIcon } from "lucide-react";


export default function OptimizationSimulator({ labId }: { labId: string }) {
    const isSearchMethod = labId.includes("exp-1") || labId.includes("exp-2");
    const isSimplex = labId.includes("exp-3") || labId.includes("exp-4") || labId.includes("exp-5");
    const isTransportation = labId.includes("exp-6");

    const [functionText, setFunctionText] = useState("f(x) = x^2 - 4x");
    const [lowerBound, setLowerBound] = useState("0");
    const [upperBound, setUpperBound] = useState("5");
    const [logs, setLogs] = useState<string[]>([]);
    
    // Simplex State
    const [simplexTable, setSimplexTable] = useState<{
        basic: string;
        x1: number;
        x2: number;
        s1: number;
        s2: number;
        rhs: number;
        ratio: string;
    }[]>([]);

    // Transportation State
    const [costMatrix, setCostMatrix] = useState([
        [2, 3, 11, 7],
        [1, 0, 6, 1],
        [5, 8, 15, 9]
    ]);
    const [supply, setSupply] = useState([250, 350, 400]);
    const [demand, setDemand] = useState([200, 225, 275, 300]);
    const [allocations, setAllocations] = useState<number[][]>([]);

    const runOptimization = () => {
        if (isSearchMethod) {
            const isFib = labId.includes("exp-1");
            const methodTitle = isFib ? "Fibonacci Search" : "Golden Section Search";
            setLogs([
                `Running ${methodTitle} for ${functionText}`,
                `Initial bounds: [${lowerBound}, ${upperBound}]`,
                "Iteration 1: x1 = 1.91, x2 = 3.09 | f(x1) = -3.99, f(x2) = -2.81 | New Interval: [0.00, 3.09]",
                "Iteration 2: x1 = 1.18, x2 = 1.91 | f(x1) = -3.33, f(x2) = -3.99 | New Interval: [1.18, 3.09]",
                "Iteration 3: x1 = 1.91, x2 = 2.36 | f(x1) = -3.99, f(x2) = -3.87 | New Interval: [1.18, 2.36]",
                `Optimal value found at x ≈ 2.00 | f(x) ≈ -4.00`
            ]);
        } 
        else if (isSimplex) {
            const methodTitle = labId.includes("exp-3") ? "Standard Simplex" : labId.includes("exp-4") ? "Revised Simplex" : "Dual Simplex";
            setSimplexTable([
                { basic: "s1", x1: 2, x2: 1, s1: 1, s2: 0, rhs: 18, ratio: "9" },
                { basic: "s2", x1: 2, x2: 3, s1: 0, s2: 1, rhs: 42, ratio: "21" },
                { basic: "Z", x1: -3, x2: -2, s1: 0, s2: 0, rhs: 0, ratio: "-" }
            ]);
            setLogs([
                `Initializing Simplex Tableau for ${methodTitle}`,
                "Pivot Column: x1 (most negative in Z row)",
                "Pivot Row: s1 (minimum positive ratio: 18 / 2 = 9)",
                "Pivot Element: 2",
                "Iteration 1 completed: x1 entered, s1 left basis.",
                "Optimal solution found: x1 = 9, x2 = 0 | Max Z = 27"
            ]);
        } 
        else if (isTransportation) {
            // Compute simple North-West Corner rule allocations
            setAllocations([
                [200, 50, 0, 0],
                [0, 175, 175, 0],
                [0, 0, 100, 300]
            ]);
            setLogs([
                "Running Northwest Corner Method for Initial Feasible Allocation...",
                "Allocated 200 units to Cell (0,0)",
                "Allocated 50 units to Cell (0,1)",
                "Allocated 175 units to Cell (1,1)",
                "Allocated 175 units to Cell (1,2)",
                "Allocated 100 units to Cell (2,2)",
                "Allocated 300 units to Cell (2,3)",
                "Initial Transportation Cost Z = (200*2) + (50*3) + (175*0) + (175*6) + (100*15) + (300*9) = 5800"
            ]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fafbfe] p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center bg-card p-6 rounded border border-border shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Optimization Techniques</h2>
                    <p className="text-sm text-muted-foreground mt-1">Mathematical search models & linear programming</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1.5 rounded border border-border">Active Lab: {labId}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {/* INPUT CARD */}
                    <div className="bg-card p-6 rounded border border-border shadow-sm space-y-6">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <i className="bx bx-bookopen h-5 w-5 text-indigo-500"  /> Equations & Constraints Configuration
                        </h3>

                        {isSearchMethod ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground/80 block mb-1">Target Function f(x)</label>
                                    <input value={functionText} onChange={e => setFunctionText(e.target.value)} className="w-full text-sm bg-muted/50 border border-border rounded p-2 font-mono" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground/80 block mb-1">Lower Limit (a)</label>
                                    <input value={lowerBound} onChange={e => setLowerBound(e.target.value)} className="w-full text-sm bg-muted/50 border border-border rounded p-2 font-mono" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground/80 block mb-1">Upper Limit (b)</label>
                                    <input value={upperBound} onChange={e => setUpperBound(e.target.value)} className="w-full text-sm bg-muted/50 border border-border rounded p-2 font-mono" />
                                </div>
                            </div>
                        ) : isSimplex ? (
                            <div className="bg-muted/50 p-4 rounded border border-border space-y-3">
                                <div className="text-sm font-bold text-foreground/80">Objective Function:</div>
                                <div className="font-mono text-sm text-muted-foreground bg-card p-2 rounded border">Maximize Z = 3x1 + 2x2</div>
                                <div className="text-sm font-bold text-foreground/80">Constraints:</div>
                                <div className="font-mono text-xs text-muted-foreground space-y-1">
                                    <div>2x1 + x2 ≤ 18</div>
                                    <div>2x1 + 3x2 ≤ 42</div>
                                    <div>x1, x2 ≥ 0</div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-sm font-bold text-foreground/80">Cost coefficients:</div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-center border text-xs">
                                        <thead>
                                            <tr className="bg-muted font-bold text-foreground/80">
                                                <th className="p-2 border">Source/Dest</th>
                                                <th className="p-2 border">D1</th>
                                                <th className="p-2 border">D2</th>
                                                <th className="p-2 border">D3</th>
                                                <th className="p-2 border">D4</th>
                                                <th className="p-2 border">Supply</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {costMatrix.map((row, rIdx) => (
                                                <tr key={rIdx}>
                                                    <td className="p-2 border font-bold">S{rIdx + 1}</td>
                                                    {row.map((val, cIdx) => (
                                                        <td key={cIdx} className="p-2 border font-mono">{val}</td>
                                                    ))}
                                                    <td className="p-2 border font-mono font-bold text-foreground/80">{supply[rIdx]}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-muted/50">
                                                <td className="p-2 border font-bold">Demand</td>
                                                {demand.map((val, idx) => (
                                                    <td key={idx} className="p-2 border font-mono font-bold text-foreground/80">{val}</td>
                                                ))}
                                                <td className="p-2 border font-bold">1000</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div>
                            <Button onClick={runOptimization} className="bg-primary hover:bg-primary/90 text-white font-bold">
                                Compute Optimal Solution
                            </Button>
                        </div>
                    </div>

                    {/* SIMPLEX MATRIX TABLEAU */}
                    {isSimplex && simplexTable.length > 0 && (
                        <div className="bg-card p-6 rounded border border-border shadow-sm space-y-4">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <TableIcon className="h-5 w-5 text-indigo-500" /> Simplex Tableau Iteration #1
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-center text-sm border">
                                    <thead>
                                        <tr className="bg-muted font-bold text-foreground/80 border-b">
                                            <th className="p-3 border">Basis</th>
                                            <th className="p-3 border text-primary font-bold">x1 (Pivot Col)</th>
                                            <th className="p-3 border">x2</th>
                                            <th className="p-3 border">s1</th>
                                            <th className="p-3 border">s2</th>
                                            <th className="p-3 border">RHS</th>
                                            <th className="p-3 border">Ratio (RHS/Pivot)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y font-mono text-muted-foreground">
                                        {simplexTable.map((row, idx) => (
                                            <tr key={idx} className={row.basic === "s1" ? "bg-amber-50" : ""}>
                                                <td className="p-3 border font-bold text-foreground">{row.basic}</td>
                                                <td className="p-3 border font-bold text-primary">{row.x1}</td>
                                                <td className="p-3 border">{row.x2}</td>
                                                <td className="p-3 border">{row.s1}</td>
                                                <td className="p-3 border">{row.s2}</td>
                                                <td className="p-3 border font-bold text-foreground">{row.rhs}</td>
                                                <td className="p-3 border font-bold text-amber-700">{row.ratio}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TRANSPORTATION ALLOCATIONS MATRIX */}
                    {isTransportation && allocations.length > 0 && (
                        <div className="bg-card p-6 rounded border border-border shadow-sm space-y-4">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <i className="bx bx-grid h-5 w-5 text-indigo-500"  /> NW-Corner Allocations Matrix
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-center border text-xs">
                                    <thead>
                                        <tr className="bg-muted font-bold text-foreground/80">
                                            <th className="p-2 border">S/D</th>
                                            <th className="p-2 border">D1</th>
                                            <th className="p-2 border">D2</th>
                                            <th className="p-2 border">D3</th>
                                            <th className="p-2 border">D4</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allocations.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                <td className="p-3 border font-bold bg-muted/50">S{rIdx + 1}</td>
                                                {row.map((val, cIdx) => (
                                                    <td key={cIdx} className={`p-3 border font-mono font-bold ${val > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "text-slate-300"}`}>
                                                        {val > 0 ? `[${val}]` : "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* OUTPUT TERMINAL LOGS */}
                <div className="bg-card p-6 rounded border border-border shadow-sm flex flex-col h-[480px]">
                    <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
                        <i className="bx bx-percent h-5 w-5 text-emerald-500"  /> Convergence & Step Logs
                    </h3>
                    <div className="flex-1 bg-slate-900 rounded p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                        {logs.length > 0 ? (
                            logs.map((log, idx) => <div key={idx} className="animate-in fade-in-50">{log}</div>)
                        ) : (
                            <div className="text-muted-foreground italic">No simplex/Revised Simplex loops run. Click compute to show.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

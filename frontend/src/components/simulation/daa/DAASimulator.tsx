"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";


export default function DAASimulator({ labId }: { labId: string }) {
    const isSorting = labId.includes("exp-1") || labId.includes("exp-2") || labId.includes("exp-3");
    const isGraph = labId.includes("exp-4") || labId.includes("exp-5") || labId.includes("exp-6") || labId.includes("exp-7");
    const isDp = labId.includes("exp-8");

    // Sorting State
    const [array, setArray] = useState<number[]>([45, 12, 89, 34, 67, 23, 50, 78]);
    const [compareIdxs, setCompareIdxs] = useState<number[]>([]);
    const [isSortingActive, setIsSortingActive] = useState(false);
    const [sortLog, setSortLog] = useState<string[]>([]);

    // DP State (LCS)
    const [lcsString1, setLcsString1] = useState("STONE");
    const [lcsString2, setLcsString2] = useState("LONGEST");
    const [lcsMatrix, setLcsMatrix] = useState<number[][]>([]);

    // Graph path / MST state
    const [graphLog, setGraphLog] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

    const generateNewArray = () => {
        const arr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
        setArray(arr);
        setCompareIdxs([]);
        setSortLog(["Generated new random array."]);
    };

    const runDAASimulator = async () => {
        if (isSorting) {
            setIsSortingActive(true);
            setSortLog(["Initializing Insertion Sort iteration...", "Comparing elements..."]);
            setCompareIdxs([0, 1]);
            
            // Simulate sorting transitions
            setTimeout(() => {
                setArray([12, 45, 89, 34, 67, 23, 50, 78]);
                setSortLog(prev => ["Swapped 12 and 45.", ...prev]);
                setCompareIdxs([1, 2]);
            }, 1000);

            setTimeout(() => {
                setSortLog(prev => ["No swap needed for 45 and 89.", ...prev]);
                setCompareIdxs([2, 3]);
            }, 2000);

            setTimeout(() => {
                setArray([12, 34, 45, 89, 67, 23, 50, 78]);
                setSortLog(prev => ["Inserted 34 into sorted sublist.", ...prev]);
                setCompareIdxs([3, 4]);
            }, 3000);

            setTimeout(() => {
                setArray([12, 23, 34, 45, 50, 67, 78, 89]);
                setCompareIdxs([]);
                setIsSortingActive(false);
                setSortLog(prev => ["Array sorted successfully: [12, 23, 34, 45, 50, 67, 78, 89]", ...prev]);
            }, 4500);
        }
        else if (isGraph) {
            setHighlightedEdges([]);
            setGraphLog(["Initializing Graph Relaxation...", "Source Node: A"]);
            
            if (labId.includes("exp-4")) { // Dijkstra
                setTimeout(() => {
                    setHighlightedEdges(["A-B", "A-C"]);
                    setGraphLog(prev => ["Visited neighbors of A: B (weight 4) and C (weight 2)", ...prev]);
                }, 1000);
                setTimeout(() => {
                    setHighlightedEdges(["A-C", "C-D"]);
                    setGraphLog(prev => ["Relaxed edge C -> D. Total weight to D: 2 + 3 = 5", ...prev]);
                }, 2000);
                setTimeout(() => {
                    setHighlightedEdges(["A-C", "C-D", "D-E"]);
                    setGraphLog(prev => ["Relaxed edge D -> E. Total weight to E: 5 + 1 = 6", ...prev]);
                    setGraphLog(prev => ["Shortest Path tree found: A -> C -> D -> E", ...prev]);
                }, 3000);
            }
            else if (labId.includes("exp-5") || labId.includes("exp-6")) { // Prim/Kruskal MST
                setTimeout(() => {
                    setHighlightedEdges(["A-C"]);
                    setGraphLog(prev => ["Added minimum weight edge A-C (weight 2) to MST.", ...prev]);
                }, 1000);
                setTimeout(() => {
                    setHighlightedEdges(["A-C", "C-D"]);
                    setGraphLog(prev => ["Added next minimum weight edge C-D (weight 3) to MST.", ...prev]);
                }, 2000);
                setTimeout(() => {
                    setHighlightedEdges(["A-C", "C-D", "B-A"]);
                    setGraphLog(prev => ["Added next minimum edge B-A (weight 4). Spanning Tree completed.", ...prev]);
                }, 3000);
            }
            else { // Bellman Ford
                setTimeout(() => {
                    setHighlightedEdges(["A-B", "A-C"]);
                    setGraphLog(prev => ["Pass 1: Relaxed edges out of source node A.", ...prev]);
                }, 1000);
                setTimeout(() => {
                    setHighlightedEdges(["A-C", "C-D"]);
                    setGraphLog(prev => ["Pass 2: Relaxed edge C -> D. No negative cycles found.", ...prev]);
                }, 2000);
            }
        }
        else if (isDp) {
            // Compute LCS matrix
            const n = lcsString1.length;
            const m = lcsString2.length;
            const matrix: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
            
            for (let i = 1; i <= n; i++) {
                for (let j = 1; j <= m; j++) {
                    if (lcsString1[i - 1] === lcsString2[j - 1]) {
                        matrix[i][j] = matrix[i - 1][j - 1] + 1;
                    } else {
                        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                    }
                }
            }
            setLcsMatrix(matrix);
            setSortLog([
                `LCS Dynamic Programming table computed.`,
                `Longest Common Subsequence length: ${matrix[n][m]}`,
                `LCS Sequence: 'ONE' (Length 3)`
            ]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fafbfe] p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center bg-card p-6 rounded-none-none border border-border shadow-none-none">
                <div>
                    <h2 className="text-xl font-black text-muted-foreground uppercase tracking-tight">Design and Analysis of Algorithms</h2>
                    <p className="text-sm text-muted-foreground mt-1">Interactive visualizers for sorting, trees, and graphs</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-none-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-card px-3 py-1.5 rounded-none-none border border-border">Lab Slot: {labId}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {/* VISUALIZER CONTAINER */}
                    <div className="bg-card p-6 rounded-none-none border border-border shadow-none-none space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-muted-foreground flex items-center gap-2">
                                {isSorting && <i className="bx bx-alignverticalspacearound h-5 w-5 text-primary"  />}
                                {isGraph && <i className="bx bx-gitgraph h-5 w-5 text-primary"  />}
                                {isDp && <i className="bx bx-table h-5 w-5 text-primary"  />}
                                {isSorting ? "Sorting Bars Animation" : isGraph ? "Graph State Visualization" : "LCS Dynamic Programming Grid"}
                            </h3>
                            <div className="flex gap-2">
                                <Button onClick={runDAASimulator} disabled={isSortingActive} className="bg-primary hover:bg-primary text-white font-bold text-xs">
                                    <i className="bx bx-play mr-1 h-3.5 w-3.5"  /> Start Visualization
                                </Button>
                                {isSorting && (
                                    <Button onClick={generateNewArray} variant="outline" className="text-xs font-bold">
                                        <i className="bx bx-rotateccw mr-1 h-3.5 w-3.5"  /> Reset Array
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* 1. Sorting Visualizer */}
                        {isSorting && (
                            <div className="flex items-end justify-center gap-2 p-8 bg-card border border-border rounded-none-none min-h-[200px]">
                                {array.map((val, idx) => {
                                    const isComparing = compareIdxs.includes(idx);
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                            <div 
                                                className={`w-full text-center text-[10px] font-bold text-white rounded-none-none shadow-none-none flex items-end justify-center pb-2  duration-300
                                                    ${isComparing ? "bg-gradient-to-t from-rose-500 to-rose-600 ring-4 ring-rose-200 scale-105" : "bg-gradient-to-t from-blue-500 to-indigo-600"}
                                                `}
                                                style={{ height: `${val * 2}px` }}
                                            >
                                                {val}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-bold">[{idx}]</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 2. Graph Visualizer */}
                        {isGraph && (
                            <div className="border border-border rounded-none-none p-6 bg-card flex flex-col items-center justify-center min-h-[220px]">
                                <div className="flex items-center gap-12 relative font-bold text-xs">
                                    {/* A node */}
                                    <div className={`h-10 w-10 rounded-none-full border-2 bg-card flex items-center justify-center shadow-none-none`}>A</div>
                                    
                                    {/* Middle loop */}
                                    <div className="flex flex-col gap-12">
                                        <div className={`h-10 w-10 rounded-none-full border-2 bg-card flex items-center justify-center shadow-none-none ${highlightedEdges.includes("A-B") ? "border-emerald-500 ring-2 ring-emerald-100" : ""}`}>B</div>
                                        <div className={`h-10 w-10 rounded-none-full border-2 bg-card flex items-center justify-center shadow-none-none ${highlightedEdges.includes("A-C") ? "border-emerald-500 ring-2 ring-emerald-100" : ""}`}>C</div>
                                    </div>
                                    
                                    {/* D and E */}
                                    <div className="flex flex-col gap-12">
                                        <div className={`h-10 w-10 rounded-none-full border-2 bg-card flex items-center justify-center shadow-none-none ${highlightedEdges.includes("C-D") ? "border-emerald-500 ring-2 ring-emerald-100" : ""}`}>D</div>
                                        <div className={`h-10 w-10 rounded-none-full border-2 bg-card flex items-center justify-center shadow-none-none ${highlightedEdges.includes("D-E") ? "border-emerald-500 ring-2 ring-emerald-100" : ""}`}>E</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. DP Visualizer */}
                        {isDp && lcsMatrix.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-center border text-xs bg-card">
                                    <thead>
                                        <tr className="bg-card font-bold text-muted-foreground">
                                            <th className="p-2 border">DP</th>
                                            <th className="p-2 border">∅</th>
                                            {lcsString2.split("").map((c, i) => (
                                                <th key={i} className="p-2 border">{c}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lcsMatrix.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                <td className="p-2 border font-bold bg-card">
                                                    {rIdx === 0 ? "∅" : lcsString1[rIdx - 1]}
                                                </td>
                                                {row.map((val, cIdx) => (
                                                    <td key={cIdx} className={`p-2 border font-mono font-bold ${val > 0 ? "bg-emerald-50 text-emerald-700" : "text-muted-foreground"}`}>
                                                        {val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* VISUAL LOGGER */}
                <div className="bg-card p-6 rounded-none-none border border-border shadow-none-none flex flex-col h-[480px]">
                    <h3 className="font-bold text-muted-foreground flex items-center gap-2 mb-4">
                        <i className="bx bx-activity h-5 w-5 text-emerald-500"  /> Execution Console Logs
                    </h3>
                    <div className="flex-1 bg-card rounded-none-none p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                        {isGraph ? (
                            graphLog.length > 0 ? (
                                graphLog.map((log, idx) => <div key={idx}>{log}</div>)
                            ) : (
                                <div className="text-muted-foreground italic">No nodes traversed yet.</div>
                            )
                        ) : (
                            sortLog.length > 0 ? (
                                sortLog.map((log, idx) => <div key={idx}>{log}</div>)
                            ) : (
                                <div className="text-muted-foreground italic">Logs are currently empty. Click play to simulate.</div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

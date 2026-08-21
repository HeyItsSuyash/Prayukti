"use client";

import { useState, useMemo } from "react";

import { TableData } from "@/lib/table-generator";

interface WorkspacesPanelProps {
    isOpen: boolean;
    onClose: () => void;
    data: TableData | null;
    loading: boolean;
}

type Tab = 'truth' | 'kmap' | 'excitation';

export function WorkspacesPanel({ isOpen, onClose, data, loading }: WorkspacesPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('truth');
    const [selectedKMapOutput, setSelectedKMapOutput] = useState<string>('');

    // Excitation Table State
    const [presentStateInput, setPresentStateInput] = useState<string>('');
    const [nextStateOutput, setNextStateOutput] = useState<string>('');

    const activeCircuit = data?.circuits?.[0];

    // Initialize defaults when data loads
    useMemo(() => {
        if (activeCircuit) {
            if (activeCircuit.outputNames.length > 0 && !selectedKMapOutput) {
                setSelectedKMapOutput(activeCircuit.outputNames[0] || '');
            }
            if (activeCircuit.inputNames.length > 0 && !presentStateInput) {
                setPresentStateInput(activeCircuit.inputNames[0] || '');
            }
            if (activeCircuit.outputNames.length > 0 && !nextStateOutput) {
                setNextStateOutput(activeCircuit.outputNames[0] || '');
            }
        }
    }, [activeCircuit, selectedKMapOutput, presentStateInput, nextStateOutput]);

    if (!isOpen) return null;

    // --- K-Map Logic ---
    const renderKMap = () => {
        if (!activeCircuit || !selectedKMapOutput) return null;
        const numInputs = activeCircuit.inputNames.length;
        if (numInputs < 2 || numInputs > 4) {
            return <div className="p-4 text-center text-muted-foreground">K-Map only supported for 2, 3, or 4 inputs.</div>;
        }

        // Gray Codes
        const gray2 = ['00', '01', '11', '10'];
        const gray1 = ['0', '1'];

        // Grid setup based on vars
        let rowLabels: string[] = [];
        let colLabels: string[] = [];
        let mapIndices: number[][] = [];

        if (numInputs === 2) {
            rowLabels = gray1;
            colLabels = gray1;
            mapIndices = [[0, 1], [2, 3]];
        } else if (numInputs === 3) {
            rowLabels = gray1;
            colLabels = gray2;
            mapIndices = [
                [0, 1, 3, 2],
                [4, 5, 7, 6]
            ];
        } else if (numInputs === 4) {
            rowLabels = gray2;
            colLabels = gray2;
            mapIndices = [
                [0, 1, 3, 2],
                [4, 5, 7, 6],
                [12, 13, 15, 14],
                [8, 9, 11, 10]
            ];
        }

        return (
            <div className="flex flex-col items-center mt-4">
                <div className="flex justify-between w-full mb-4 px-2">
                    <label className="text-xs font-bold">Output Variable:</label>
                    <select
                        value={selectedKMapOutput}
                        onChange={(e) => setSelectedKMapOutput(e.target.value)}
                        className="text-xs border rounded-none px-1"
                    >
                        {activeCircuit.outputNames.map(o => (
                            <option key={o} value={o}>{o}</option>
                        ))}
                    </select>
                </div>

                <div className="relative border-2 border-border rounded-none bg-card">
                    {/* Top Left Label */}
                    <div className="absolute -top-6 -left-6 text-xs font-bold font-mono">
                        {numInputs === 2 ? `${activeCircuit.inputNames[0]}\\${activeCircuit.inputNames[1]}` :
                            numInputs === 3 ? `${activeCircuit.inputNames[0]}\\${activeCircuit.inputNames[1]}${activeCircuit.inputNames[2]}` :
                                `${activeCircuit.inputNames[0]}${activeCircuit.inputNames[1]}\\${activeCircuit.inputNames[2]}${activeCircuit.inputNames[3]}`}
                    </div>

                    {/* Column Labels */}
                    <div className="flex border-b border-border">
                        <div className="w-8"></div> {/* Corner spacer */}
                        {colLabels.map(l => (
                            <div key={l} className="w-10 text-center text-xs font-mono font-bold bg-card py-1 border-l border-border">
                                {l}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {rowLabels.map((rLabel, rIdx) => (
                        <div key={rLabel} className="flex">
                            {/* Row Label */}
                            <div className="w-8 flex items-center justify-center text-xs font-mono font-bold bg-card border-r border-border border-t border-border">
                                {rLabel}
                            </div>

                            {/* Cells */}
                            {mapIndices[rIdx] && mapIndices[rIdx].map((dataIndex, cIdx) => {
                                const val = activeCircuit.rows[dataIndex]?.outputs?.[selectedKMapOutput];
                                return (
                                    <div key={cIdx} className={`w-10 h-10 flex items-center justify-center border-l border-t border-border font-bold ${val ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                                        {val}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- Excitation Logic ---
    const renderExcitationTable = () => {
        if (!activeCircuit) return null;

        const transitions = {
            '0->0': [] as string[],
            '0->1': [] as string[],
            '1->0': [] as string[],
            '1->1': [] as string[]
        };

        activeCircuit.rows.forEach(row => {
            const ps = row.inputs[presentStateInput];
            const ns = row.outputs[nextStateOutput];
            const key = `${ps}->${ns}`;

            const otherInputs = activeCircuit.inputNames
                .filter(n => n !== presentStateInput)
                .map(n => `${n}=${row.inputs[n]}`)
                .join(', ');

            if (transitions[key as keyof typeof transitions]) {
                transitions[key as keyof typeof transitions].push(otherInputs || '(None)');
            }
        });

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <label className="block font-bold mb-1.5 text-foreground">Present State (Qn)</label>
                        <select
                            value={presentStateInput}
                            onChange={(e) => setPresentStateInput(e.target.value)}
                            className="w-full bg-muted border border-border text-foreground font-semibold rounded-xl p-2 outline-none"
                        >
                            {activeCircuit.inputNames.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold mb-1.5 text-foreground">Next State (Qn+1)</label>
                        <select
                            value={nextStateOutput}
                            onChange={(e) => setNextStateOutput(e.target.value)}
                            className="w-full bg-muted border border-border text-foreground font-semibold rounded-xl p-2 outline-none"
                        >
                            {activeCircuit.outputNames.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <table className="w-full text-xs text-center border-collapse border border-border rounded-xl overflow-hidden">
                    <thead className="bg-primary/10 text-primary border-b border-border">
                        <tr>
                            <th className="p-2.5 border border-border font-bold">Transition (Qn &rarr; Qn+1)</th>
                            <th className="p-2.5 border border-border font-bold">Required Inputs</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        <tr className="hover:bg-muted/40">
                            <td className="p-2 border border-border font-bold bg-muted/30">0 &rarr; 0</td>
                            <td className="p-2 border border-border text-left px-4 font-mono">{transitions['0->0'].join(' OR ') || '-'}</td>
                        </tr>
                        <tr className="hover:bg-muted/40">
                            <td className="p-2 border border-border font-bold bg-muted/30">0 &rarr; 1</td>
                            <td className="p-2 border border-border text-left px-4 font-mono">{transitions['0->1'].join(' OR ') || '-'}</td>
                        </tr>
                        <tr className="hover:bg-muted/40">
                            <td className="p-2 border border-border font-bold bg-muted/30">1 &rarr; 0</td>
                            <td className="p-2 border border-border text-left px-4 font-mono">{transitions['1->0'].join(' OR ') || '-'}</td>
                        </tr>
                        <tr className="hover:bg-muted/40">
                            <td className="p-2 border border-border font-bold bg-muted/30">1 &rarr; 1</td>
                            <td className="p-2 border border-border text-left px-4 font-mono">{transitions['1->1'].join(' OR ') || '-'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="absolute top-16 right-4 w-[480px] h-[580px] bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden">
            <div className="bg-card border-b border-border p-3 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value as Tab)}
                            className="bg-muted text-foreground font-bold text-xs px-3 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer pr-8 appearance-none"
                        >
                            <option value="truth">Truth Table</option>
                            <option value="kmap">K-Map Analysis</option>
                            <option value="excitation">Excitation Table</option>
                        </select>
                        <i className="bx bx-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm" />
                    </div>
                </div>

                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Circuit Analysis
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-card">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="text-xs">Analyzing Circuit Logic...</span>
                    </div>
                )}

                {!loading && (!data || !activeCircuit) && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        No inputs/outputs detected. Add nodes to simulation.
                    </div>
                )}

                {!loading && activeCircuit && (
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border min-h-full">
                        {activeTab === 'truth' && (
                            <div className="overflow-x-auto">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 text-center tracking-wider">System Truth Table</h3>
                                <table className="w-full text-xs text-center border-collapse border border-border rounded-lg overflow-hidden">
                                    <thead className="bg-muted text-foreground">
                                        <tr>
                                            {activeCircuit.inputNames.map((name) => (
                                                <th key={name} className="px-3 py-2 border border-border font-bold">{name}</th>
                                            ))}
                                            {activeCircuit.outputNames.map((name) => (
                                                <th key={name} className="px-3 py-2 border border-border font-bold text-primary bg-primary/10">{name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {activeCircuit.rows.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                {activeCircuit.inputNames.map((name) => (
                                                    <td key={name} className="px-3 py-1.5 border border-border text-foreground font-mono">{row.inputs[name]}</td>
                                                ))}
                                                {activeCircuit.outputNames.map((name) => (
                                                    <td key={name} className="px-3 py-1.5 font-bold text-primary border border-border bg-primary/5 font-mono">{row.outputs[name]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'kmap' && renderKMap()}
                        {activeTab === 'excitation' && renderExcitationTable()}
                    </div>
                )}
            </div>
        </div>
    );
}

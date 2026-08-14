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

    // Initialize defaults when data loads
    useMemo(() => {
        if (data) {
            if (data.outputNames.length > 0 && !selectedKMapOutput) {
                setSelectedKMapOutput(data.outputNames[0] || '');
            }
            if (data.inputNames.length > 0 && !presentStateInput) {
                setPresentStateInput(data.inputNames[0] || '');
            }
            if (data.outputNames.length > 0 && !nextStateOutput) {
                setNextStateOutput(data.outputNames[0] || '');
            }
        }
    }, [data, selectedKMapOutput, presentStateInput, nextStateOutput]);

    if (!isOpen) return null;

    // --- K-Map Logic ---
    const renderKMap = () => {
        if (!data || !selectedKMapOutput) return null;
        const numInputs = data.inputNames.length;
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

        if (numInputs === 2) { // AB -> Row: A, Col: B
            rowLabels = gray1; // A=0, A=1
            colLabels = gray1; // B=0, B=1
            // 00, 01, 10, 11 (Standard binary order is 0,1,2,3)
            // Grid is [0, 1]
            //         [2, 3]
            mapIndices = [[0, 1], [2, 3]];
        } else if (numInputs === 3) { // ABC -> Row: A, Col: BC
            rowLabels = gray1;
            colLabels = gray2;
            // 000, 001, 011, 010 (Indices: 0, 1, 3, 2)
            // 100, 101, 111, 110 (Indices: 4, 5, 7, 6)
            mapIndices = [
                [0, 1, 3, 2],
                [4, 5, 7, 6]
            ];
        } else if (numInputs === 4) { // ABCD -> Row: AB, Col: CD
            rowLabels = gray2;
            colLabels = gray2;
            // Rows: 00, 01, 11, 10
            // Cols: 00, 01, 11, 10
            mapIndices = [
                [0, 1, 3, 2],      // 00xx
                [4, 5, 7, 6],      // 01xx
                [12, 13, 15, 14],  // 11xx (Indices 12-15)
                [8, 9, 11, 10]     // 10xx (Indices 8-11)
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
                        {data.outputNames.map(o => (
                            <option key={o} value={o}>{o}</option>
                        ))}
                    </select>
                </div>

                <div className="relative border-2 border-border rounded-none bg-card">
                    {/* Top Left Label */}
                    <div className="absolute -top-6 -left-6 text-xs font-bold font-mono">
                        {numInputs === 2 ? `${data.inputNames[0]}\\${data.inputNames[1]}` :
                            numInputs === 3 ? `${data.inputNames[0]}\\${data.inputNames[1]}${data.inputNames[2]}` :
                                `${data.inputNames[0]}${data.inputNames[1]}\\${data.inputNames[2]}${data.inputNames[3]}`}
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
                                const val = data.rows[dataIndex]?.outputs?.[selectedKMapOutput];
                                return (
                                    <div key={cIdx} className={`w-10 h-10 flex items-center justify-center border-l border-t border-border font-bold ${val ? 'text-[#d32f2f] bg-red-50' : 'text-muted-foreground'}`}>
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
        if (!data) return null;

        // Group inputs by transition
        // Transitions: 0->0, 0->1, 1->0, 1->1
        const transitions = {
            '0->0': [] as string[],
            '0->1': [] as string[],
            '1->0': [] as string[],
            '1->1': [] as string[]
        };

        data.rows.forEach(row => {
            const ps = row.inputs[presentStateInput]; // Present State Value
            const ns = row.outputs[nextStateOutput];   // Next State Value
            const key = `${ps}->${ns}`;

            // Format other inputs (Excitation Inputs)
            const otherInputs = data.inputNames
                .filter(n => n !== presentStateInput)
                .map(n => `${n}=${row.inputs[n]}`)
                .join(', ');

            if (transitions[key as keyof typeof transitions]) {
                transitions[key as keyof typeof transitions].push(otherInputs || '(None)');
            }
        });

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <label className="block font-bold mb-1">Present State (Qn)</label>
                        <select
                            value={presentStateInput}
                            onChange={(e) => setPresentStateInput(e.target.value)}
                            className="w-full border rounded-none p-1"
                        >
                            {data.inputNames.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Next State (Qn+1)</label>
                        <select
                            value={nextStateOutput}
                            onChange={(e) => setNextStateOutput(e.target.value)}
                            className="w-full border rounded-none p-1"
                        >
                            {data.outputNames.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <table className="w-full text-xs text-center border-collapse border">
                    <thead className="bg-[#f57f17] text-white">
                        <tr>
                            <th className="p-2 border">Transition (Qn &rarr; Qn+1)</th>
                            <th className="p-2 border">Required Inputs</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-2 font-bold bg-card">0 &rarr; 0</td>
                            <td className="p-2 text-left px-4">{transitions['0->0'].join(' OR ') || '-'}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 font-bold bg-card">0 &rarr; 1</td>
                            <td className="p-2 text-left px-4">{transitions['0->1'].join(' OR ') || '-'}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 font-bold bg-card">1 &rarr; 0</td>
                            <td className="p-2 text-left px-4">{transitions['1->0'].join(' OR ') || '-'}</td>
                        </tr>
                        <tr>
                            <td className="p-2 font-bold bg-card">1 &rarr; 1</td>
                            <td className="p-2 text-left px-4">{transitions['1->1'].join(' OR ') || '-'}</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-[10px] text-muted-foreground italic">
                    * Shows input combinations required to achieve specific state transitions.
                </p>
            </div>
        );
    };

    return (
        <div className="absolute top-12 right-4 w-[450px] h-[550px] bg-card border shadow-none-none rounded-none-none flex flex-col z-20 overflow-hidden">
            {/* Header */}
            <div className="bg-[#d32f2f] text-white flex justify-between items-center shadow-none-none z-10">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('truth')}
                        className={`px-4 py-3 text-xs font-bold flex items-center gap-2 ${activeTab === 'truth' ? 'bg-card text-[#d32f2f]' : 'hover:bg-[#b71c1c]'}`}
                    >
                        <i className="bx bx-table"  /> Truth Table
                    </button>
                    <button
                        onClick={() => setActiveTab('kmap')}
                        className={`px-4 py-3 text-xs font-bold flex items-center gap-2 ${activeTab === 'kmap' ? 'bg-card text-[#d32f2f]' : 'hover:bg-[#b71c1c]'}`}
                    >
                        <i className="bx bx-grid3x3"  /> K-Map
                    </button>
                    <button
                        onClick={() => setActiveTab('excitation')}
                        className={`px-4 py-3 text-xs font-bold flex items-center gap-2 ${activeTab === 'excitation' ? 'bg-card text-[#d32f2f]' : 'hover:bg-[#b71c1c]'}`}
                    >
                        <i className="bx bx-arrowrightleft"  /> Excitation Table
                    </button>
                </div>
                <button onClick={onClose} className="hover:bg-[#b71c1c] rounded-none p-2 mr-2">
                    <i className="bx bx-x"  />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 bg-card">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        <span className="text-xs">Analyzing Circuit Logic...</span>
                    </div>
                )}

                {!loading && !data && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        No inputs/outputs detected. Add nodes to simulation.
                    </div>
                )}

                {!loading && data && (
                    <div className="bg-card p-4 rounded-none shadow-none-none border min-h-full">

                        {/* Truth Table View */}
                        {activeTab === 'truth' && (
                            <div className="overflow-x-auto">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 text-center">System Truth Table</h3>
                                <table className="w-full text-xs text-center">
                                    <thead className="bg-card text-muted-foreground">
                                        <tr>
                                            {data.inputNames.map((name) => (
                                                <th key={name} className="px-2 py-2 border-b-2 border-r border-border">{name}</th>
                                            ))}
                                            {data.outputNames.map((name) => (
                                                <th key={name} className="px-2 py-2 border-b-2 border-l-2 border-red-100 text-red-600 font-bold bg-red-50">{name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {data.rows.map((row, i) => (
                                            <tr key={i} className="hover:bg-card">
                                                {data.inputNames.map((name) => (
                                                    <td key={name} className="px-2 py-1 border-r text-muted-foreground">{row.inputs[name]}</td>
                                                ))}
                                                {data.outputNames.map((name) => (
                                                    <td key={name} className="px-2 py-1 font-bold text-muted-foreground border-l border-red-50 bg-red-50/30">{row.outputs[name]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* K-Map View */}
                        {activeTab === 'kmap' && renderKMap()}

                        {/* Excitation Table View */}
                        {activeTab === 'excitation' && renderExcitationTable()}

                    </div>
                )}
            </div>
        </div>
    );
}

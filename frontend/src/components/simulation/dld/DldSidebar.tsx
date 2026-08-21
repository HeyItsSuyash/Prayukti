import React, { useState } from 'react';
import { MultiCircuitAnalysis, SingleCircuitTableData } from '@/lib/table-generator';

interface DldSidebarProps {
    onAddNode: (type: string, label: string, data?: any) => void;
    tableData?: MultiCircuitAnalysis | null;
}

export const DldSidebar = ({ onAddNode, tableData }: DldSidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'components' | 'analysis'>('components');
    const [analysisTab, setAnalysisTab] = useState<'truth' | 'kmap' | 'excitation'>('truth');

    const [isAnalysisDropdownOpen, setIsAnalysisDropdownOpen] = useState<boolean>(false);
    const [selectedKMapOutput, setSelectedKMapOutput] = useState<Record<string, string>>({});
    const [isKMapDropdownOpen, setIsKMapDropdownOpen] = useState<Record<string, boolean>>({});

    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        'io': true,
        'gates': true,
        'msi': true
    });

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const circuits = tableData?.circuits || [];

    if (isCollapsed) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="m-4 z-40 p-3 bg-card border border-border rounded-xl shadow-lg hover:bg-muted text-foreground flex items-center gap-2 text-xs font-bold transition-all self-start"
                title="Expand Simulator Tools"
            >
                <i className="bx bx-chevrons-right text-lg text-primary" />
                <span>Tools</span>
            </button>
        );
    }

    return (
        <div className="w-96 h-full bg-card border-r border-border shadow-md overflow-hidden flex flex-col z-30 flex-shrink-0 transition-all select-none relative">
            {/* Header & Tab Toggle */}
            <div className="p-3 border-b border-border bg-card/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Simulator Tools</h2>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Collapse Sidebar"
                    >
                        <i className="bx bx-chevrons-left text-lg" />
                    </button>
                </div>

                {/* Main Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-muted/60 rounded-xl text-xs font-bold">
                    <button
                        onClick={() => setActiveTab('components')}
                        className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'components' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <i className="bx bx-chip" />
                        <span>Components</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'analysis' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <i className="bx bx-table" />
                        <span>Truth & K-Map</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'components' ? (
                <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">

                    {/* I/O Category */}
                    <div className="space-y-1.5 border border-border/50 rounded-xl p-2 bg-muted/20">
                        <button
                            onClick={() => toggleCategory('io')}
                            className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg text-xs font-bold text-foreground transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <i className="bx bx-zap text-amber-500 text-sm" />
                                <span>Input / Output</span>
                            </div>
                            <i className={`bx bx-chevron-down text-sm transition-transform duration-200 ${openCategories['io'] ? 'rotate-180' : ''}`} />
                        </button>

                        {openCategories['io'] && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <SidebarItem label="Switch" onClick={() => onAddNode('inputNode', 'Input')} icon="sw" type="inputNode" />
                                <SidebarItem label="LED" onClick={() => onAddNode('outputNode', 'Output')} icon="led" type="outputNode" />
                                <SidebarItem label="Hex Display" onClick={() => onAddNode('hexDisplayNode', 'Hex')} icon="88" type="hexDisplayNode" />
                                <SidebarItem label="Clock" onClick={() => onAddNode('clockNode', 'Clock')} icon="clk" disabled type="clockNode" />
                            </div>
                        )}
                    </div>

                    {/* Gates Category */}
                    <div className="space-y-1.5 border border-border/50 rounded-xl p-2 bg-muted/20">
                        <button
                            onClick={() => toggleCategory('gates')}
                            className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg text-xs font-bold text-foreground transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <i className="bx bx-cpu text-primary text-sm" />
                                <span>Logic Gates</span>
                            </div>
                            <i className={`bx bx-chevron-down text-sm transition-transform duration-200 ${openCategories['gates'] ? 'rotate-180' : ''}`} />
                        </button>

                        {openCategories['gates'] && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <SidebarItem label="AND" onClick={() => onAddNode('and', 'AND')} type="and" iconNode={
                                    <svg viewBox="0 0 40 40" className="w-7 h-7 stroke-foreground fill-none stroke-[2.5]"><path d="M5,5 L20,5 A15,15 0 0 1 20,35 L5,35 Z" /></svg>
                                } />
                                <SidebarItem label="OR" onClick={() => onAddNode('or', 'OR')} type="or" iconNode={
                                    <svg viewBox="0 0 40 40" className="w-7 h-7 stroke-foreground fill-none stroke-[2.5]"><path d="M5,5 Q20,5 25,20 Q20,35 5,35 Q10,20 5,5 Z" /></svg>
                                } />
                                <SidebarItem label="NOT" onClick={() => onAddNode('not', 'NOT')} type="not" iconNode={
                                    <svg viewBox="0 0 40 40" className="w-7 h-7 stroke-foreground fill-none stroke-[2.5]"><path d="M5,5 L25,20 L5,35 Z" /><circle cx="28" cy="20" r="3" /></svg>
                                } />
                                <SidebarItem label="NAND" onClick={() => onAddNode('nand', 'NAND')} type="nand" iconNode={
                                    <svg viewBox="0 0 40 40" className="w-7 h-7 stroke-foreground fill-none stroke-[2.5]"><path d="M5,5 L20,5 A15,15 0 0 1 20,35 L5,35 Z" /><circle cx="38" cy="20" r="3" /></svg>
                                } />
                                <SidebarItem label="NOR" onClick={() => onAddNode('nor', 'NOR')} type="nor" iconNode={
                                    <svg viewBox="0 0 40 40" className="w-7 h-7 stroke-foreground fill-none stroke-[2.5]"><path d="M5,5 Q20,5 25,20 Q20,35 5,35 Q10,20 5,5 Z" /><circle cx="28" cy="20" r="3" /></svg>
                                } />
                                <SidebarItem label="XOR" onClick={() => onAddNode('xor', 'XOR')} type="xor" iconNode={
                                    <svg viewBox="0 0 40 40" className="w-7 h-7 stroke-foreground fill-none stroke-[2.5]"><path d="M10,5 Q25,5 30,20 Q25,35 10,35 Q15,20 10,5 Z" /><path d="M2,5 Q7,20 2,35" /></svg>
                                } />
                                <SidebarItem label="XNOR" onClick={() => onAddNode('xnor', 'XNOR')} type="xnor" iconNode={
                                    <svg viewBox="0 0 40 40" className="w-7 h-7 stroke-foreground fill-none stroke-[2.5]"><path d="M10,5 Q25,5 30,20 Q25,35 10,35 Q15,20 10,5 Z" /><path d="M2,5 Q7,20 2,35" /><circle cx="33" cy="20" r="3" /></svg>
                                } />
                            </div>
                        )}
                    </div>

                    {/* MSI Category */}
                    <div className="space-y-1.5 border border-border/50 rounded-xl p-2 bg-muted/20">
                        <button
                            onClick={() => toggleCategory('msi')}
                            className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg text-xs font-bold text-foreground transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <i className="bx bx-chip text-emerald-500 text-sm" />
                                <span>Integrated Circuits</span>
                            </div>
                            <i className={`bx bx-chevron-down text-sm transition-transform duration-200 ${openCategories['msi'] ? 'rotate-180' : ''}`} />
                        </button>

                        {openCategories['msi'] && (
                            <div className="grid grid-cols-1 gap-2 pt-1">
                                <SidebarItem label="Multiplexer 4:1" onClick={() => onAddNode('muxNode', 'MUX', { muxType: '4:1' })} type="muxNode" data={{ muxType: '4:1' }} />
                                <SidebarItem label="Demultiplexer 1:4" onClick={() => onAddNode('demuxNode', 'DEMUX', { demuxType: '1:4' })} type="demuxNode" data={{ demuxType: '1:4' }} />
                                <SidebarItem label="Decoder 2:4" onClick={() => onAddNode('decoderNode', 'DEC')} type="decoderNode" />
                                <SidebarItem label="Encoder 4:2" onClick={() => onAddNode('encoderNode', 'ENC')} type="encoderNode" />
                                <SidebarItem label="JK Flip-Flop" onClick={() => onAddNode('flipflopNode', 'JK FF', { ffType: 'JK' })} type="flipflopNode" data={{ ffType: 'JK' }} />
                                <SidebarItem label="D Flip-Flop" onClick={() => onAddNode('flipflopNode', 'D FF', { ffType: 'D' })} type="flipflopNode" data={{ ffType: 'D' }} />
                                <SidebarItem label="Comparator 4-bit" onClick={() => onAddNode('comparatorNode', 'COMP')} type="comparatorNode" />
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                /* Analysis Tab View */
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {/* Analysis Mode Toggle */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsAnalysisDropdownOpen(!isAnalysisDropdownOpen)}
                            className="w-full bg-card border border-border text-foreground font-bold text-xs p-2.5 rounded-xl flex items-center justify-between shadow-sm hover:bg-muted/50 transition-colors"
                        >
                            <span>
                                {analysisTab === 'truth' && 'Truth Table Analysis'}
                                {analysisTab === 'kmap' && 'K-Map Karnaugh Map'}
                                {analysisTab === 'excitation' && 'Excitation & Transition Table'}
                            </span>
                            <i className={`bx bx-chevron-down text-sm transition-transform duration-200 ${isAnalysisDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isAnalysisDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                {[
                                    { value: 'truth', label: 'Truth Table Analysis' },
                                    { value: 'kmap', label: 'K-Map Karnaugh Map' },
                                    { value: 'excitation', label: 'Excitation & Transition Table' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            setAnalysisTab(option.value as any);
                                            setIsAnalysisDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between ${analysisTab === option.value ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                                    >
                                        <span>{option.label}</span>
                                        {analysisTab === option.value && <i className="bx bx-check text-sm text-primary" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {circuits.length === 0 ? (
                        <div className="text-center py-12 px-4 bg-muted/20 border border-dashed border-border rounded-xl">
                            <i className="bx bx-error-circle text-2xl text-muted-foreground mb-2 block" />
                            <p className="text-xs font-bold text-foreground mb-1">No Connected Circuit Found</p>
                            <p className="text-[11px] text-muted-foreground">
                                Connect input switches to logic gates and output LEDs on the canvas to generate independent circuit analysis tables.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {circuits.map((circuitData: SingleCircuitTableData) => (
                                <div key={circuitData.circuitId} className="border border-border/80 rounded-xl p-3 bg-muted/10 space-y-3">
                                    {/* Circuit Identification Header */}
                                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-primary/15 text-primary text-[10px] font-black rounded-md uppercase tracking-wider">
                                                {circuitData.circuitName}
                                            </span>
                                            <span className="text-xs font-bold text-foreground">
                                                ({circuitData.gateSummary})
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {circuitData.inputNames.length} In / {circuitData.outputNames.length} Out
                                        </span>
                                    </div>

                                    {/* TRUTH TABLE VIEW */}
                                    {analysisTab === 'truth' && (
                                        <div className="mx-1 overflow-x-auto border border-border/70 rounded-lg bg-card shadow-xs">
                                            <table className="w-full text-[11px] text-center border-collapse">
                                                <thead className="bg-muted/80 text-foreground font-bold">
                                                    <tr>
                                                        {circuitData.inputNames.map((name: string) => (
                                                            <th key={name} className="py-1.5 px-2 border-b border-r border-border text-[10px] uppercase font-mono">{name}</th>
                                                        ))}
                                                        {circuitData.outputNames.map((name: string) => (
                                                            <th key={name} className="py-1.5 px-2 border-b border-r border-border text-[10px] uppercase font-mono text-primary bg-primary/10">{name}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {circuitData.rows.map((row: any, i: number) => {
                                                        const isCurrentRow = circuitData.inputNames.length > 0 && circuitData.inputNames.every((name: string) => {
                                                            const matchNode = circuitData.inputNodes.find((n: any) => ((n.data?.label as string) || n.id) === name);
                                                            return matchNode ? (matchNode.data?.value ?? 0) === row.inputs[name] : true;
                                                        });

                                                        return (
                                                            <tr key={i} className={`font-mono transition-colors ${isCurrentRow ? 'bg-primary/25 font-bold border-y-2 border-primary/60' : 'hover:bg-muted/30'}`}>
                                                                {circuitData.inputNames.map((name: string) => (
                                                                    <td key={name} className="py-1 px-2 border-r border-border text-foreground">
                                                                        <span className={isCurrentRow ? 'text-primary font-bold' : ''}>{row.inputs[name]}</span>
                                                                    </td>
                                                                ))}
                                                                {circuitData.outputNames.map((name: string) => (
                                                                    <td key={name} className={`py-1 px-2 font-bold border-r border-border ${row.outputs[name] === 1 ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground'}`}>
                                                                        {row.outputs[name]}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* K-MAP VIEW */}
                                    {analysisTab === 'kmap' && (
                                        <KMapRender circuit={circuitData} />
                                    )}

                                    {/* EXCITATION TABLE VIEW */}
                                    {analysisTab === 'excitation' && (
                                        <ExcitationRender circuit={circuitData} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Component for rendering working K-Map grid
const KMapRender = ({ circuit }: { circuit: SingleCircuitTableData }) => {
    const [selectedOutput, setSelectedOutput] = useState<string>(circuit.outputNames[0] || '');
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const activeOut = selectedOutput || circuit.outputNames[0] || '';
    const inputs = circuit.inputNames;
    const numInputs = inputs.length;

    // Helper to get minterm value from truth table
    const getVal = (inputMap: Record<string, number>) => {
        const matchingRow = circuit.rows.find(r => {
            return Object.entries(inputMap).every(([k, v]) => r.inputs[k] === v);
        });
        return matchingRow ? (matchingRow.outputs[activeOut] ?? 0) : 0;
    };

    return (
        <div className="mx-1 p-2 bg-card border border-border/70 rounded-lg space-y-3">
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground text-[11px]">Output Variable:</span>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-muted/50 border border-border px-2.5 py-1 rounded-md font-bold text-foreground text-[11px] flex items-center gap-1.5 hover:bg-muted transition-colors"
                    >
                        <span>{activeOut}</span>
                        <i className={`bx bx-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-xl py-1 z-50 min-w-[90px]">
                            {circuit.outputNames.map((o: string) => (
                                <button
                                    key={o}
                                    type="button"
                                    onClick={() => {
                                        setSelectedOutput(o);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-1 text-[11px] font-bold transition-colors ${activeOut === o ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                                >
                                    {o}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {numInputs === 1 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-center border-collapse border border-border">
                        <thead>
                            <tr className="bg-muted text-foreground font-bold">
                                <th className="p-1 border border-border">{inputs[0]}</th>
                                <th className="p-1 border border-border">0</th>
                                <th className="p-1 border border-border">1</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-1 font-bold border border-border bg-muted/40">{activeOut}</td>
                                <td className="p-1 border border-border font-mono font-bold text-primary">{getVal({ [inputs[0]]: 0 })}</td>
                                <td className="p-1 border border-border font-mono font-bold text-primary">{getVal({ [inputs[0]]: 1 })}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {numInputs === 2 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-center border-collapse border border-border">
                        <thead>
                            <tr className="bg-muted text-foreground font-bold">
                                <th className="p-1.5 border border-border">{inputs[0]} \ {inputs[1]}</th>
                                <th className="p-1.5 border border-border font-mono">0</th>
                                <th className="p-1.5 border border-border font-mono">1</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[0, 1].map(r => (
                                <tr key={r}>
                                    <td className="p-1.5 font-bold border border-border bg-muted/40 font-mono">{r}</td>
                                    {[0, 1].map(c => {
                                        const val = getVal({ [inputs[0]]: r, [inputs[1]]: c });
                                        return (
                                            <td key={c} className={`p-1.5 border border-border font-mono font-bold ${val === 1 ? 'bg-emerald-500/20 text-emerald-500' : 'text-muted-foreground'}`}>
                                                {val}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {numInputs === 3 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-center border-collapse border border-border">
                        <thead>
                            <tr className="bg-muted text-foreground font-bold">
                                <th className="p-1.5 border border-border text-[10px]">{inputs[0]} \ {inputs[1]}{inputs[2]}</th>
                                {['00', '01', '11', '10'].map(code => (
                                    <th key={code} className="p-1.5 border border-border font-mono text-[10px]">{code}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[0, 1].map(r => (
                                <tr key={r}>
                                    <td className="p-1.5 font-bold border border-border bg-muted/40 font-mono">{r}</td>
                                    {[[0, 0], [0, 1], [1, 1], [1, 0]].map(([c1, c2], cIdx) => {
                                        const val = getVal({ [inputs[0]]: r, [inputs[1]]: c1, [inputs[2]]: c2 });
                                        return (
                                            <td key={cIdx} className={`p-1.5 border border-border font-mono font-bold ${val === 1 ? 'bg-emerald-500/20 text-emerald-500' : 'text-muted-foreground'}`}>
                                                {val}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {numInputs > 3 && (
                <div className="text-[10px] text-muted-foreground italic text-center p-2">
                    K-Map grid display is optimized for 1 to 3 input variables ({numInputs} inputs present).
                </div>
            )}
        </div>
    );
};

// Component for rendering Excitation and Transition Tables
const ExcitationRender = ({ circuit }: { circuit: SingleCircuitTableData }) => {
    return (
        <div className="mx-1 p-2 bg-card border border-border/70 rounded-lg space-y-3 text-[11px]">
            <div className="font-bold text-foreground text-[11px] border-b border-border/50 pb-1">
                Excitation / Transition Matrix:
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-center border-collapse border border-border">
                    <thead className="bg-muted/80 text-foreground font-bold">
                        <tr>
                            <th className="py-1.5 px-2 border-b border-r border-border text-[10px]">State (Qn)</th>
                            {circuit.inputNames.map(name => (
                                <th key={name} className="py-1.5 px-2 border-b border-r border-border text-[10px] font-mono">{name}</th>
                            ))}
                            <th className="py-1.5 px-2 border-b border-r border-border text-[10px] text-primary bg-primary/10">Next (Qn+1)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono">
                        {circuit.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-muted/30">
                                <td className="py-1 px-2 border-r border-border text-muted-foreground">S{idx}</td>
                                {circuit.inputNames.map(name => (
                                    <td key={name} className="py-1 px-2 border-r border-border text-foreground">{row.inputs[name]}</td>
                                ))}
                                <td className="py-1 px-2 border-r border-border font-bold text-primary bg-primary/5">
                                    {Object.values(row.outputs)[0] ?? 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SidebarItem = ({ label, onClick, icon, iconNode, disabled, type, data }: { label: string, onClick: () => void, icon?: string, iconNode?: React.ReactNode, disabled?: boolean, type?: string, data?: any }) => {

    const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string, nodeData?: any) => {
        event.dataTransfer.setData('application/reactflow/type', nodeType);
        event.dataTransfer.setData('application/reactflow/label', nodeLabel);
        if (nodeData) {
            event.dataTransfer.setData('application/reactflow/data', JSON.stringify(nodeData));
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <button
            type="button"
            draggable={!disabled}
            onDragStart={(event) => onDragStart(event, type || 'default', label, data)}
            onClick={onClick}
            disabled={disabled}
            className={`
        w-full flex flex-col items-center justify-center p-3 rounded-none-none border border-border bg-card hover:border-primary hover:shadow-none-none transition-all group
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
      `}
        >
            {/* Simple Icon Representation */}
            <div className="w-8 h-8 mb-2 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors pointer-events-none">
                {iconNode ? iconNode : (icon ? (
                    <span className="font-mono text-[10px] font-bold uppercase">{icon}</span>
                ) : (
                    <div className="w-6 h-4 border-2 border-current rounded-none-sm"></div>
                ))}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-muted-foreground text-center leading-tight pointer-events-none">{label}</span>
        </button>
    );
};

import React, { useState } from 'react';


interface DldSidebarProps {
    onAddNode: (type: string, label: string, data?: any) => void;
}

export const DldSidebar = ({ onAddNode, tableData }: DldSidebarProps & { tableData?: any }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'components' | 'analysis'>('components');
    const [analysisTab, setAnalysisTab] = useState<'truth' | 'kmap' | 'excitation'>('truth');
    
    // Excitation states
    const [presentStateInput, setPresentStateInput] = useState<string>('');
    const [nextStateOutput, setNextStateOutput] = useState<string>('');
    const [selectedKMapOutput, setSelectedKMapOutput] = useState<string>('');

    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        'io': true,
        'gates': true,
        'msi': true
    });

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    // Auto set defaults for K-Map & Excitation
    React.useMemo(() => {
        if (tableData) {
            if (tableData.outputNames?.length > 0 && !selectedKMapOutput) {
                setSelectedKMapOutput(tableData.outputNames[0] || '');
            }
            if (tableData.inputNames?.length > 0 && !presentStateInput) {
                setPresentStateInput(tableData.inputNames[0] || '');
            }
            if (tableData.outputNames?.length > 0 && !nextStateOutput) {
                setNextStateOutput(tableData.outputNames[0] || '');
            }
        }
    }, [tableData, selectedKMapOutput, presentStateInput, nextStateOutput]);

    if (isCollapsed) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="absolute left-4 top-4 z-50 p-3 bg-card border border-border rounded-xl shadow-lg hover:bg-muted text-foreground flex items-center gap-2 text-xs font-bold transition-all"
                title="Expand Simulator Tools"
            >
                <i className="bx bx-chevrons-right text-lg text-primary" />
                <span>Tools</span>
            </button>
        );
    }

    return (
        <div className="absolute left-4 top-4 bottom-4 w-80 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col z-50 transition-all select-none">
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
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    <div className="relative">
                        <select
                            value={analysisTab}
                            onChange={(e) => setAnalysisTab(e.target.value as any)}
                            className="w-full bg-muted border border-border text-foreground font-bold text-xs p-2 rounded-xl outline-none appearance-none cursor-pointer pr-8"
                        >
                            <option value="truth">Truth Table</option>
                            <option value="kmap">K-Map Analysis</option>
                            <option value="excitation">Excitation Table</option>
                        </select>
                        <i className="bx bx-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm" />
                    </div>

                    {!tableData ? (
                        <div className="text-center py-10 text-muted-foreground text-xs font-semibold">
                            Add input switches & output LEDs to circuit canvas to generate live logic table.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {analysisTab === 'truth' && (
                                <div className="overflow-x-auto border border-border rounded-xl">
                                    <table className="w-full text-xs text-center border-collapse">
                                        <thead className="bg-muted text-foreground">
                                            <tr>
                                                {tableData.inputNames.map((name: string) => (
                                                    <th key={name} className="p-2 border-b border-r border-border font-bold">{name}</th>
                                                ))}
                                                {tableData.outputNames.map((name: string) => (
                                                    <th key={name} className="p-2 border-b border-border font-bold text-primary bg-primary/10">{name}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {tableData.rows.map((row: any, i: number) => (
                                                <tr key={i} className="hover:bg-muted/40 font-mono">
                                                    {tableData.inputNames.map((name: string) => (
                                                        <td key={name} className="p-1.5 border-r border-border text-foreground">{row.inputs[name]}</td>
                                                    ))}
                                                    {tableData.outputNames.map((name: string) => (
                                                        <td key={name} className="p-1.5 font-bold text-primary bg-primary/5">{row.outputs[name]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {analysisTab === 'kmap' && (
                                <div className="p-2 bg-muted/20 border border-border rounded-xl text-xs space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">Output Variable:</span>
                                        <select
                                            value={selectedKMapOutput}
                                            onChange={(e) => setSelectedKMapOutput(e.target.value)}
                                            className="bg-card border border-border p-1 rounded-lg font-bold"
                                        >
                                            {tableData.outputNames.map((o: string) => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic text-center">
                                        Live K-Map view automatically synchronized with inputs.
                                    </p>
                                </div>
                            )}

                            {analysisTab === 'excitation' && (
                                <div className="p-2 bg-muted/20 border border-border rounded-xl text-xs space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="block font-bold mb-1">Qn</span>
                                            <select
                                                value={presentStateInput}
                                                onChange={(e) => setPresentStateInput(e.target.value)}
                                                className="w-full bg-card border border-border p-1 rounded-lg font-semibold"
                                            >
                                                {tableData.inputNames.map((n: string) => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <span className="block font-bold mb-1">Qn+1</span>
                                            <select
                                                value={nextStateOutput}
                                                onChange={(e) => setNextStateOutput(e.target.value)}
                                                className="w-full bg-card border border-border p-1 rounded-lg font-semibold"
                                            >
                                                {tableData.outputNames.map((n: string) => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
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

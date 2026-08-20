import React, { useState } from 'react';


interface DldSidebarProps {
    onAddNode: (type: string, label: string, data?: any) => void;
}

export const DldSidebar = ({ onAddNode }: DldSidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        'io': true,
        'gates': true,
        'msi': true
    });

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    if (isCollapsed) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="absolute left-4 top-4 z-50 p-3 bg-card border border-border rounded-xl shadow-lg hover:bg-muted text-foreground flex items-center gap-2 text-xs font-bold transition-all"
                title="Expand Component Palette"
            >
                <i className="bx bx-chevrons-right text-lg text-primary" />
                <span>Components</span>
            </button>
        );
    }

    return (
        <div className="absolute left-4 top-4 bottom-4 w-72 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-2xl overflow-hidden flex flex-col z-50 transition-all select-none">
            <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-foreground text-sm uppercase tracking-wider">Components</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Drag and drop onto canvas</p>
                </div>
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Collapse Sidebar"
                >
                    <i className="bx bx-chevrons-left text-lg" />
                </button>
            </div>

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

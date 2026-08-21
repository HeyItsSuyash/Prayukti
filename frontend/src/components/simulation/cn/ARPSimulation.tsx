"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Database, Server, Network, Activity, Trash2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// --- Types ---
type NodeType = 'pc' | 'switch';

interface Node {
    id: string;
    name: string;
    ip: string;
    mac: string;
    type: NodeType;
}

interface ArpEntry {
    ip: string;
    mac: string;
    type: 'Dynamic' | 'Static';
}

interface Packet {
    id: number;
    sourceIds: string[]; // e.g., ["pc1"] -> ["switch"] then ["switch"] -> ["pc2", "pc3"]
    targetIds: string[];
    type: 'arp-request' | 'arp-reply' | 'icmp';
    data: string;
    progress: number; // 0 to 100
    stage: 'to-switch' | 'from-switch';
    originalSender?: string;
}

const NODES: Record<string, Node> = {
    pc1: { id: "pc1", name: "PC-1", ip: "192.168.1.2", mac: "AA:BB:CC:11:22:33", type: "pc" },
    switch1: { id: "switch1", name: "Network Switch", ip: "N/A", mac: "N/A", type: "switch" },
    pc2: { id: "pc2", name: "PC-2", ip: "192.168.1.3", mac: "DD:EE:FF:44:55:66", type: "pc" },
    pc3: { id: "pc3", name: "PC-3", ip: "192.168.1.4", mac: "11:22:33:44:55:77", type: "pc" },
};

const PC_NODES = ['pc1', 'pc2', 'pc3'];

const INITIAL_TERMINAL = [
    "[SYSTEM] Terminal initialized.",
    "Type 'help' for available commands."
];

interface ObservationEvent {
    step: number;
    action: string;
    result: string;
    time: string;
}

export default function ARPSimulation({ labId }: { labId: string }) {
    // --- State ---
    const [activeTab, setActiveTab] = useState<'simulation' | 'observation'>('simulation');
    const [observationEvents, setObservationEvents] = useState<ObservationEvent[]>([]);
    const [selectedSourceId, setSelectedSourceId] = useState<string>('pc1');
    const [arpTables, setArpTables] = useState<Record<string, ArpEntry[]>>({ pc1: [], pc2: [], pc3: [] });
    const [packets, setPackets] = useState<Packet[]>([]);
    const [terminalOutput, setTerminalOutput] = useState<string[]>(INITIAL_TERMINAL);
    const [terminalInput, setTerminalInput] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);
    const [stats, setStats] = useState({ requestsSent: 0, repliesReceived: 0, pingSuccesses: 0 });

    const activeNode = NODES[selectedSourceId];
    const activeArpTable = arpTables[selectedSourceId] || [];

    // Auto-scroll terminal
    const terminalEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [terminalOutput]);

    const addObservation = useCallback((action: string, result: string) => {
        setObservationEvents(prev => [...prev, {
            step: prev.length + 1,
            action,
            result,
            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);
    }, []);

    // Animation Loop
    useEffect(() => {
        if (!isAnimating || packets.length === 0) return;

        const interval = setInterval(() => {
            setPackets((prevPackets) => {
                let allDone = true;
                const updated = prevPackets.map(p => {
                    if (p.progress < 100) {
                        allDone = false;
                        return { ...p, progress: Math.min(100, p.progress + 2) }; // speed
                    }
                    return p;
                });

                if (allDone) {
                    handlePacketArrivals(updated);
                    return []; // Clear packets after arrival processing
                }
                return updated;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [isAnimating, packets]);

    const appendTerminal = (line: string) => {
        setTerminalOutput(prev => [...prev, line]);
    };

    const handlePacketArrivals = (arrivedPackets: Packet[]) => {
        arrivedPackets.forEach(packet => {
            if (packet.stage === 'to-switch') {
                if (packet.type === 'arp-request') {
                    // Broadcast to all PCs except sender
                    const targetIds = PC_NODES.filter(id => id !== packet.sourceIds[0]);
                    setTimeout(() => {
                        setPackets([{
                            id: Date.now(),
                            sourceIds: ["switch1"],
                            targetIds: targetIds,
                            type: 'arp-request',
                            data: packet.data,
                            progress: 0,
                            stage: 'from-switch',
                            originalSender: packet.sourceIds[0]
                        }]);
                        setIsAnimating(true);
                    }, 500);
                } else if (packet.type === 'arp-reply' || packet.type === 'icmp') {
                    // Unicast back to original sender
                    setTimeout(() => {
                        setPackets([{
                            id: Date.now(),
                            sourceIds: ["switch1"],
                            targetIds: packet.targetIds, // The target is the original sender
                            type: packet.type,
                            data: packet.data,
                            progress: 0,
                            stage: 'from-switch'
                        }]);
                        setIsAnimating(true);
                    }, 500);
                }
            } else if (packet.stage === 'from-switch') {
                if (packet.type === 'arp-request') {
                    const match = packet.data.match(/Who has ([\d\.]+)\? Tell ([\d\.]+)/);
                    if (match && match[1] && match[2]) {
                        const targetIp = match[1];
                        const senderIp = match[2];
                        const senderNode = Object.values(NODES).find(n => n.ip === senderIp);
                        const receivingNodes = packet.targetIds.map(id => NODES[id]);

                        let replySent = false;

                        receivingNodes.forEach(node => {
                            if (node.ip === targetIp) {
                                if (node.id === selectedSourceId) {
                                    appendTerminal(`[${node.name}] Received ARP Request. It's me! Sending Reply.`);
                                }
                                addObservation("Target device replied", `ARP Reply sent by ${node.ip} to ${senderIp}`);
                                setTimeout(() => {
                                    setPackets([{
                                        id: Date.now(),
                                        sourceIds: [node.id],
                                        targetIds: senderNode ? [senderNode.id] : [],
                                        type: 'arp-reply',
                                        data: `${targetIp} is at ${node.mac}`,
                                        progress: 0,
                                        stage: 'to-switch'
                                    }]);
                                    setIsAnimating(true);
                                    setStats(s => ({ ...s, repliesReceived: s.repliesReceived + 1 }));
                                }, 1000);
                                replySent = true;
                            }
                        });

                        if (!replySent && packet.targetIds.includes(selectedSourceId)) {
                            appendTerminal(`[Network] ARP Request failed: Host ${targetIp} unreachable.`);
                        }
                    }
                } else if (packet.type === 'arp-reply') {
                    const receivingNodeId = packet.targetIds[0];
                    const receivingNode = NODES[receivingNodeId];
                    if (receivingNodeId === selectedSourceId) {
                        appendTerminal(`[${receivingNode.name}] Received ARP Reply: ${packet.data}`);
                    }
                    const match = packet.data.match(/([\d\.]+) is at ([\w:]+)/);
                    if (match) {
                        const ip = match[1];
                        const mac = match[2];

                        setArpTables(prev => {
                            const nodeTable = prev[receivingNodeId] || [];
                            if (!nodeTable.find(e => e.ip === ip)) {
                                addObservation("ARP table updated", `Entry added successfully to ${receivingNode.name}: ${ip} -> ${mac}`);
                                return { ...prev, [receivingNodeId]: [...nodeTable, { ip, mac, type: 'Dynamic' }] };
                            }
                            return prev;
                        });

                        if (receivingNodeId === selectedSourceId) {
                            appendTerminal(`[${receivingNode.name}] ARP Cache updated. Proceeding with ICMP Echo.`);
                            setTimeout(() => {
                                sendPingPacket(ip, mac, receivingNodeId);
                            }, 1000);
                        }
                    }
                } else if (packet.type === 'icmp') {
                    const receivingNodeId = packet.targetIds[0];
                    const receivingNode = NODES[receivingNodeId];

                    if (receivingNodeId === selectedSourceId) {
                        appendTerminal(`[${receivingNode.name}] Received Reply from ${packet.data} bytes=32 time<1ms TTL=64`);
                    }
                    addObservation("Ping successful", `ICMP Echo Reply received from ${packet.data}`);
                    setStats(s => ({ ...s, pingSuccesses: s.pingSuccesses + 1 }));
                }
                setIsAnimating(false);
            }
        });
    };

    const sendPingPacket = (ip: string, mac: string, sourceId: string) => {
        const sourceNode = NODES[sourceId];
        appendTerminal(`[${sourceNode.name}] Sending ICMP Echo Request to ${ip} (${mac})`);

        const targetNode = Object.values(NODES).find(n => n.ip === ip);

        setPackets([{
            id: Date.now(),
            sourceIds: [sourceId],
            targetIds: targetNode ? [targetNode.id] : ["switch1"], // Switch handles it if target not directly resolved in animation logic
            type: 'icmp',
            data: ip, // storing target ip in data field to extract later
            progress: 0,
            stage: 'to-switch'
        }]);
        setIsAnimating(true);
    };

    const initiatePing = (targetIp: string) => {
        if (isAnimating) {
            appendTerminal(`[Error] Network is currently busy.`);
            return;
        }

        appendTerminal(`\nC:\\> ping ${targetIp}`);

        if (targetIp === activeNode.ip) {
            appendTerminal(`Reply from ${targetIp}: bytes=32 time<1ms TTL=128`);
            return;
        }

        const cacheEntry = activeArpTable.find(entry => entry.ip === targetIp);

        if (cacheEntry) {
            appendTerminal(`[Local] MAC address for ${targetIp} found in ARP cache (${cacheEntry.mac}).`);
            sendPingPacket(targetIp, cacheEntry.mac, selectedSourceId);
        } else {
            appendTerminal(`[Local] MAC address for ${targetIp} NOT found in ARP cache.`);
            appendTerminal(`[${activeNode.name}] Broadcasting ARP Request: "Who has ${targetIp}? Tell ${activeNode.ip}"`);
            addObservation("ARP Request broadcast", `All devices received request for ${targetIp} from ${activeNode.ip}`);
            setStats(s => ({ ...s, requestsSent: s.requestsSent + 1 }));

            setPackets([{
                id: Date.now(),
                sourceIds: [selectedSourceId],
                targetIds: ["switch1"],
                type: 'arp-request',
                data: `Who has ${targetIp}? Tell ${activeNode.ip}`,
                progress: 0,
                stage: 'to-switch'
            }]);
            setIsAnimating(true);
        }
    };

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = terminalInput.trim().toLowerCase();
        setTerminalInput("");

        if (!cmd) return;

        appendTerminal(`C:\\> ${cmd}`);

        if (cmd === 'help') {
            appendTerminal(`Commands: ping <ip>, arp -a, arp -d, clear, ipconfig`);
        } else if (cmd === 'ipconfig') {
            appendTerminal(`\nWindows IP Configuration\n\nEthernet adapter Local Area Connection:\n   IPv4 Address. . . . . . . . . . . : ${activeNode.ip}\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Physical Address. . . . . . . . . : ${activeNode.mac}\n`);
        } else if (cmd === 'clear') {
            setTerminalOutput([]);
        } else if (cmd === 'arp -a') {
            if (activeArpTable.length === 0) {
                appendTerminal(`No ARP Entries Found.`);
            } else {
                appendTerminal(`\nInterface: ${activeNode.ip} --- 0x1\n  Internet Address      Physical Address      Type`);
                activeArpTable.forEach(entry => {
                    appendTerminal(`  ${entry.ip.padEnd(21)} ${entry.mac.padEnd(21)} ${entry.type}`);
                });
            }
        } else if (cmd === 'arp -d') {
            setArpTables(prev => ({ ...prev, [selectedSourceId]: [] }));
            appendTerminal(`ARP Cache cleared.`);
            addObservation("ARP cache flushed", `All dynamic entries removed for ${activeNode.name}`);
        } else if (cmd.startsWith('ping ')) {
            const ip = cmd.split(' ')[1];
            if (!ip || !ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                appendTerminal(`Ping request could not find host ${ip}. Please check the name and try again.`);
            } else {
                initiatePing(ip);
            }
        } else {
            appendTerminal(`'${cmd}' is not recognized as an internal or external command.`);
        }
    };

    const handleReset = () => {
        setArpTables({ pc1: [], pc2: [], pc3: [] });
        setPackets([]);
        setObservationEvents([]);
        setStats({ requestsSent: 0, repliesReceived: 0, pingSuccesses: 0 });
        setTerminalOutput(INITIAL_TERMINAL);
        setIsAnimating(false);
        addObservation("Simulation Reset", "All states cleared");
    };

    // Visualization rendering logic
    const getCoordinates = (nodeId: string) => {
        // Layout: Left: PC-1, Middle: Switch, Right-Top: PC-2, Right-Bottom: PC-3
        if (nodeId === 'switch1') return { x: "50%", y: "50%" };
        if (nodeId === 'pc1') return { x: "15%", y: "50%" };
        if (nodeId === 'pc2') return { x: "85%", y: "25%" };
        if (nodeId === 'pc3') return { x: "85%", y: "75%" };
        return { x: "50%", y: "50%" };
    };

    return (
        <div className="flex flex-col h-[700px] bg-card font-sans rounded-xl overflow-hidden border">
            {/* Top Toolbar */}
            <div className="bg-card border-b p-4 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-3">
                    <Network className="text-primary" />
                    <h2 className="text-xl font-black uppercase tracking-tight text-muted-foreground">ARP Sandbox</h2>

                    <div className="ml-6 flex items-center bg-card p-1 rounded-xl">
                        <button
                            className={`px-4 py-1.5 text-sm font-semibold rounded-xl  ${activeTab === 'simulation' ? 'bg-card shadow-md text-primary' : 'text-muted-foreground hover:text-muted-foreground'}`}
                            onClick={() => setActiveTab('simulation')}
                        >
                            Simulation
                        </button>
                        <button
                            className={`px-4 py-1.5 text-sm font-semibold rounded-xl  ${activeTab === 'observation' ? 'bg-card shadow-md text-primary' : 'text-muted-foreground hover:text-muted-foreground'}`}
                            onClick={() => setActiveTab('observation')}
                        >
                            Observation
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-sm font-semibold text-muted-foreground mr-2">Quick Ping:</span>
                    {PC_NODES.filter(id => id !== selectedSourceId).map(id => (
                        <Button key={id} variant="outline" size="sm" onClick={() => initiatePing(NODES[id].ip)} disabled={isAnimating}>
                            {NODES[id].name}
                        </Button>
                    ))}
                    <div className="w-px h-6 bg-card mx-2"></div>
                    <Button variant="destructive" size="sm" onClick={handleReset} disabled={isAnimating}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                </div>
            </div>

            {activeTab === 'simulation' ? (
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Sender & Controls */}
                    <div className="w-80 bg-card border-r flex flex-col z-10 shadow-md">
                        <div className="p-4 border-b bg-card">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Server className="text-primary w-5 h-5" />
                                    <h3 className="font-bold text-muted-foreground">Source Device</h3>
                                </div>
                            </div>
                            <select
                                className="w-full p-2 mb-3 border rounded-xl text-sm font-semibold text-muted-foreground bg-card focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedSourceId}
                                disabled={isAnimating}
                                onChange={(e) => {
                                    setSelectedSourceId(e.target.value);
                                    setTerminalOutput([`[SYSTEM] Context switched to ${NODES[e.target.value].name}.`, "Type 'help' for available commands."]);
                                }}
                            >
                                {PC_NODES.map(id => (
                                    <option key={id} value={id}>{NODES[id].name} ({NODES[id].ip})</option>
                                ))}
                            </select>
                            <div className="text-xs font-mono text-muted-foreground bg-card p-2 border rounded-none">
                                <div>IP:  {activeNode.ip}</div>
                                <div>MAC: {activeNode.mac}</div>
                            </div>
                        </div>

                        {/* Terminal */}
                        <div className="flex flex-col flex-1 min-h-[50%] border-b">
                            <div className="bg-stone-900 text-stone-400 text-xs px-3 py-1 font-bold tracking-wider flex items-center justify-between">
                                <span>Command Prompt - {activeNode.name}</span>
                                <Terminal className="w-3 h-3" />
                            </div>
                            <div className="flex-1 bg-black text-green-400 p-3 font-mono text-xs overflow-y-auto leading-relaxed">
                                {terminalOutput.map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                                <div ref={terminalEndRef} />
                            </div>
                            <form onSubmit={handleCommand} className="flex bg-black p-1 border-t border-border">
                                <span className="text-green-400 font-mono text-xs p-2">C:\&gt;</span>
                                <Input
                                    value={terminalInput}
                                    onChange={(e) => setTerminalInput(e.target.value)}
                                    className="flex-1 bg-transparent border-none text-green-400 font-mono text-xs shadow-md focus-visible:ring-0 rounded-xl h-8 px-0"
                                    placeholder={`ping 192.168.1...`}
                                    disabled={isAnimating}
                                />
                            </form>
                        </div>

                        {/* ARP Cache */}
                        <div className="flex flex-col min-h-[30%] bg-card">
                            <div className="px-3 py-2 border-b flex justify-between items-center bg-card">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Database className="w-3 h-3" /> ARP Cache ({activeNode.name})
                                </h4>
                                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isAnimating} onClick={() => {
                                    setArpTables(prev => ({ ...prev, [selectedSourceId]: [] }));
                                    appendTerminal(`C:\\> arp -d\nARP Cache cleared.`);
                                    addObservation("ARP cache flushed", `All dynamic entries removed for ${activeNode.name}`);
                                }}>
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                            </div>
                            <div className="p-2 overflow-y-auto flex-1">
                                {activeArpTable.length === 0 ? (
                                    <div className="text-xs text-muted-foreground italic text-center mt-4">Table is empty</div>
                                ) : (
                                    <table className="w-full text-left text-xs text-muted-foreground">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="pb-1 font-semibold">IP Address</th>
                                                <th className="pb-1 font-semibold">MAC Address</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeArpTable.map((entry, i) => (
                                                <tr key={i} className="border-b border-dashed">
                                                    <td className="py-1 font-mono">{entry.ip}</td>
                                                    <td className="py-1 font-mono">{entry.mac}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Visualization area */}
                    <div className="flex-1 relative bg-card/50 flex flex-col items-center justify-center p-8 overflow-hidden">

                        {/* The topology */}
                        <div className="relative w-full max-w-2xl h-96 flex items-center justify-between border-2 border-dashed border-border rounded-xl bg-card/50 p-8 shadow-md">

                            {/* PC-1 Node (Left) */}
                            <div id="pc1" className={`relative z-10 flex flex-col items-center p-4 bg-card border-2 shadow-md rounded-xl  ${selectedSourceId === 'pc1' ? 'border-primary ring-4 ring-blue-100' : 'border-border'}`}>
                                <Server className={`w-12 h-12 mb-2 ${selectedSourceId === 'pc1' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <Badge variant={selectedSourceId === 'pc1' ? "default" : "secondary"} className="mb-1">PC-1</Badge>
                                <span className="font-mono text-[10px] text-muted-foreground">{NODES.pc1.ip}</span>
                            </div>

                            {/* Switch Node (Center) */}
                            <div id="switch1" className="relative z-10 flex flex-col items-center p-6 bg-card border-4 border-border shadow-md rounded-xl">
                                <Activity className="w-10 h-10 text-emerald-400 mb-2" />
                                <span className="text-white font-bold tracking-widest text-sm uppercase">Switch</span>
                            </div>

                            {/* Receivers (Right) */}
                            <div className="relative z-10 flex flex-col gap-12">
                                <div id="pc2" className={`flex flex-col items-center p-4 bg-card border-2 shadow-md rounded-xl  ${selectedSourceId === 'pc2' ? 'border-primary ring-4 ring-blue-100' : 'border-border'}`}>
                                    <Server className={`w-8 h-8 mb-2 ${selectedSourceId === 'pc2' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <Badge variant={selectedSourceId === 'pc2' ? "default" : "secondary"} className="mb-1">PC-2</Badge>
                                    <span className="font-mono text-[10px] text-muted-foreground">{NODES.pc2.ip}</span>
                                </div>
                                <div id="pc3" className={`flex flex-col items-center p-4 bg-card border-2 shadow-md rounded-xl  ${selectedSourceId === 'pc3' ? 'border-primary ring-4 ring-blue-100' : 'border-border'}`}>
                                    <Server className={`w-8 h-8 mb-2 ${selectedSourceId === 'pc3' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <Badge variant={selectedSourceId === 'pc3' ? "default" : "secondary"} className="mb-1">PC-3</Badge>
                                    <span className="font-mono text-[10px] text-muted-foreground">{NODES.pc3.ip}</span>
                                </div>
                            </div>

                            {/* Path lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                                <line x1="15%" y1="50%" x2="50%" y2="50%" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="8 8" />
                                <line x1="50%" y1="50%" x2="85%" y2="25%" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="8 8" />
                                <line x1="50%" y1="50%" x2="85%" y2="75%" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="8 8" />
                            </svg>

                            {/* Active Packet Animations */}
                            {packets.map(p => {
                                let startLayout = getCoordinates(p.sourceIds[0]);
                                let targetsLayout = p.targetIds.map(id => ({ id, ...getCoordinates(id) }));

                                // Reverse routing logic for from-switch stage
                                if (p.stage === 'from-switch') {
                                    startLayout = getCoordinates('switch1');
                                } else {
                                    targetsLayout = [{ id: 'switch1', ...getCoordinates('switch1') }];
                                }

                                return targetsLayout.map(targetLayout => {
                                    const colorClass = p.type === 'arp-request' ? 'bg-amber-400' : p.type === 'arp-reply' ? 'bg-primary' : 'bg-primary';
                                    const label = p.type === 'arp-request' ? 'ARP REQ' : p.type === 'arp-reply' ? 'ARP REP' : 'ICMP';

                                    return (
                                        <div
                                            key={`${p.id}-${targetLayout.id}`}
                                            className={`absolute flex items-center justify-center font-bold text-[10px] py-1 px-3 rounded-full text-white shadow-md ${colorClass} z-20`}
                                            style={{
                                                left: `calc( ${startLayout.x} + (${targetLayout.x} - ${startLayout.x}) * ${p.progress / 100})`,
                                                top: `calc( ${startLayout.y} + (${targetLayout.y} - ${startLayout.y}) * ${p.progress / 100})`,
                                                transform: 'translate(-50%, -50%)',
                                                transition: 'left 0.05s linear, top 0.05s linear'
                                            }}
                                        >
                                            {label}
                                        </div>
                                    );
                                });
                            })}
                        </div>

                        {/* Stats Dashboard */}
                        <div className="absolute bottom-6 left-6 right-6 bg-card border shadow-md p-4 rounded-xl flex justify-around">
                            <div className="text-center">
                                <div className="text-3xl font-black text-muted-foreground">{stats.requestsSent}</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ARP Requests Sent</div>
                            </div>
                            <div className="w-px bg-card"></div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-muted-foreground">{stats.repliesReceived}</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ARP Replies Received</div>
                            </div>
                            <div className="w-px bg-card"></div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-muted-foreground">
                                    {Object.values(arpTables).reduce((acc, curr) => acc + curr.length, 0)}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Cache Pointers</div>
                            </div>
                            <div className="w-px bg-card"></div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-primary">{stats.pingSuccesses}</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-primary">Ping Successes</div>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto bg-card p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-muted-foreground tracking-tight">Simulation Observations</h3>
                                <p className="text-muted-foreground mt-2">A real-time log of events triggered during your ARP simulation.</p>
                            </div>
                            <Badge variant="outline" className="px-4 py-1 text-sm">
                                Total Events: {observationEvents.length}
                            </Badge>
                        </div>

                        {observationEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 bg-card border border-dashed rounded-xl shadow-md">
                                <Activity className="w-12 h-12 text-muted-foreground mb-4" />
                                <h4 className="text-lg font-bold text-muted-foreground">No events recorded yet</h4>
                                <p className="text-muted-foreground">Run some ping commands in the simulation to see observations here.</p>
                            </div>
                        ) : (
                            <div className="bg-card border rounded-xl shadow-md overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-card">
                                        <tr>
                                            <th className="p-4 font-bold text-muted-foreground w-24">Step</th>
                                            <th className="p-4 font-bold text-muted-foreground w-32">Time</th>
                                            <th className="p-4 font-bold text-muted-foreground">Action performed</th>
                                            <th className="p-4 font-bold text-muted-foreground">Resulting observed state</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-muted-foreground">
                                        {observationEvents.map((evt, idx) => (
                                            <tr key={idx} className="hover:bg-card transition-colors">
                                                <td className="p-4 font-mono font-bold text-primary">{evt.step}</td>
                                                <td className="p-4 font-mono text-xs text-muted-foreground">{evt.time}</td>
                                                <td className="p-4 font-medium text-muted-foreground">{evt.action}</td>
                                                <td className="p-4">{evt.result}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Play, Pause, RotateCcw, Activity, Zap, Clock, Monitor, CheckCircle2, AlertCircle, XCircle
} from "lucide-react";

interface Node {
    id: number;
    state: "idle" | "sensing" | "transmitting" | "collision" | "backoff" | "jamming" | "success";
    backoffCount: number;
    backoffRemaining: number;
    packetProgress: number;
    color: string;
}

interface Stats {
    collisions: number;
    successful: number;
    totalPackets: number;
    throughput: number;
    avgDelay: number;
}

interface LogEvent {
    time: string;
    node: string;
    event: string;
    type: "info" | "warning" | "success" | "error";
}

const quizQuestions = [
    { question: "What does 'Carrier Sense' mean in CSMA/CD?", options: ["Detecting hardware", "Checking if idle before transmitting", "Measuring signal", "Identifying source"], answer: 1 },
    { question: "In CSMA/CD, what happens immediately after a collision is detected?", options: ["Node shuts down", "Increases power", "Sends jamming signal and stops", "Ignores collision"], answer: 2 },
    { question: "Which algorithm is used to determine the wait time after a collision?", options: ["Round Robin", "LRU", "Binary Exponential Backoff", "Dijkstra"], answer: 2 },
    { question: "What is the primary MAC method for legacy Ethernet?", options: ["Token Ring", "CSMA/CA", "CSMA/CD", "TDMA"], answer: 2 },
    { question: "As nodes increase in CSMA/CD, what happens to throughput?", options: ["Increases linearly", "Decreases due to collisions", "Remains constant", "Doubles"], answer: 1 }
];

export default function CSMASimulation() {
    const [nodeCount, setNodeCount] = useState(4);
    const [packetSize, setPacketSize] = useState(100);
    const [transProb, setTransProb] = useState(0.02);
    const [simSpeed, setSimSpeed] = useState(1);
    
    const [nodes, setNodes] = useState<Node[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [channelState, setChannelState] = useState<"idle" | "busy" | "collision">("idle");
    const [stats, setStats] = useState<Stats>({ collisions: 0, successful: 0, totalPackets: 0, throughput: 0, avgDelay: 0 });
    const [time, setTime] = useState(0);
    const [history, setHistory] = useState<{ t: number, throughput: number, collisions: number }[]>([]);
    const [eventLog, setEventLog] = useState<LogEvent[]>([]);

    const [activeTab, setActiveTab] = useState("simulation");
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null, null, null]);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const formatTime = (t: number) => {
        const h = Math.floor(t / 360).toString().padStart(2, '0');
        const m = Math.floor((t % 360) / 60).toString().padStart(2, '0');
        const s = (t % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const addLog = useCallback((node: string, event: string, type: LogEvent["type"]) => {
        setEventLog(prev => [{ time: formatTime(time), node, event, type }, ...prev].slice(0, 50));
    }, [time]);

    useEffect(() => {
        const colors = ["bg-[#059669]", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-[#059669]", "bg-rose-500", "bg-amber-500", "bg-cyan-500"];
        const initialNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
            id: i + 1, state: "idle", backoffCount: 0, backoffRemaining: 0, packetProgress: 0, color: colors[i % colors.length] as string
        }));
        setNodes(initialNodes);
        resetSimulation();
    }, [nodeCount]);

    const resetSimulation = () => {
        setIsRunning(false);
        setTime(0);
        setHistory([]);
        setEventLog([{ time: "00:00:00", node: "System", event: "Simulation started", type: "info" }]);
        setChannelState("idle");
        setStats({ collisions: 0, successful: 0, totalPackets: 0, throughput: 0, avgDelay: 0 });
        setNodes(prev => prev.map(n => ({ ...n, state: "idle", backoffCount: 0, backoffRemaining: 0, packetProgress: 0 })));
    };

    const calculateBackoff = (k: number) => Math.floor(Math.random() * (Math.pow(2, Math.min(k, 10)) - 1)) * 10;

    const tick = useCallback(() => {
        setTime(prev => prev + 1);
        setNodes(prevNodes => {
            let nextNodes = [...prevNodes];
            let transmittingCount = nextNodes.filter(n => n.state === "transmitting" || n.state === "jamming").length;
            let logUpdates: LogEvent[] = [];

            nextNodes = nextNodes.map(node => {
                if (node.state === "idle" && Math.random() < transProb) return { ...node, state: "sensing" };
                if (node.state === "sensing") {
                    if (transmittingCount === 0) {
                        logUpdates.push({ time: formatTime(time), node: `PC-${node.id}`, event: "Started transmitting frame", type: "success" });
                        return { ...node, state: "transmitting", packetProgress: 0 };
                    }
                    return node;
                }
                if (node.state === "transmitting") {
                    if (transmittingCount > 1) {
                        logUpdates.push({ time: formatTime(time), node: `PC-${node.id}`, event: "Collision detected", type: "error" });
                        return { ...node, state: "collision" };
                    }
                    const nextProgress = node.packetProgress + (5 * simSpeed);
                    if (nextProgress >= packetSize) return { ...node, state: "success", packetProgress: 100, backoffCount: 0 };
                    return { ...node, packetProgress: nextProgress };
                }
                if (node.state === "success") {
                    setStats(s => ({ ...s, successful: s.successful + 1, totalPackets: s.totalPackets + 1, throughput: (s.successful + 1) / (time + 1) * 100 }));
                    return { ...node, state: "idle", packetProgress: 0 };
                }
                if (node.state === "collision") {
                    setStats(s => ({ ...s, collisions: s.collisions + 1 }));
                    return { ...node, state: "jamming", packetProgress: 0 };
                }
                if (node.state === "jamming") {
                    const backoff = calculateBackoff(node.backoffCount + 1);
                    logUpdates.push({ time: formatTime(time), node: `PC-${node.id}`, event: `Backoff time: ${backoff/10}s`, type: "warning" });
                    return { ...node, state: "backoff", backoffCount: node.backoffCount + 1, backoffRemaining: backoff };
                }
                if (node.state === "backoff") {
                    if (node.backoffRemaining <= 0) return { ...node, state: "sensing" };
                    return { ...node, backoffRemaining: node.backoffRemaining - 1 };
                }
                return node;
            });
            
            if (logUpdates.length > 0) {
                setEventLog(prev => [...logUpdates, ...prev].slice(0, 50));
            }

            const currentTransmitting = nextNodes.filter(n => n.state === "transmitting" || n.state === "jamming").length;
            setChannelState(currentTransmitting > 1 ? "collision" : currentTransmitting === 1 ? "busy" : "idle");
            return nextNodes;
        });

        if (time % 20 === 0) setHistory(h => [...h.slice(-20), { t: time, throughput: stats.throughput, collisions: stats.collisions }]);
    }, [transProb, simSpeed, packetSize, stats, time]);

    useEffect(() => {
        if (isRunning) timerRef.current = setInterval(tick, 100 / simSpeed);
        else if (timerRef.current) clearInterval(timerRef.current);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning, simSpeed, tick]);

    const handleQuizOption = (qIdx: number, oIdx: number) => {
        if (quizSubmitted) return;
        const newAnswers = [...quizAnswers];
        newAnswers[qIdx] = oIdx;
        setQuizAnswers(newAnswers);
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-y-auto font-sans">
            {/* Tabs */}
            <div className="flex border-b sticky top-0 bg-card z-10 shadow-sm px-4">
                {["Simulation", "Quiz"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === tab.toLowerCase() ? "border-[#059669] text-[#059669]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="p-4 md:p-6 max-w-[1800px] mx-auto w-full">
                {activeTab === "simulation" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN - Controls */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                <h3 className="font-bold text-foreground flex items-center gap-2 text-sm uppercase tracking-widest">
                                    <Activity className="h-4 w-4 text-[#059669]" /> Control Panel
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center"><label className="text-xs font-bold text-muted-foreground uppercase">Number of Nodes</label><span className="text-xs font-bold text-[#059669]">{nodeCount}</span></div>
                                        <Slider value={[nodeCount]} min={2} max={8} step={1} onValueChange={(v) => setNodeCount(v[0]!)} disabled={isRunning} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center"><label className="text-xs font-bold text-muted-foreground uppercase">Packet Size</label><span className="text-xs font-bold text-[#059669]">{packetSize} Bytes</span></div>
                                        <Slider value={[packetSize]} min={50} max={500} step={10} onValueChange={(v) => setPacketSize(v[0]!)} disabled={isRunning} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center"><label className="text-xs font-bold text-muted-foreground uppercase">Traffic Load</label><span className="text-xs font-bold text-[#059669]">{(transProb * 100).toFixed(1)}%</span></div>
                                        <Slider value={[transProb * 100]} min={0.5} max={10} step={0.5} onValueChange={(v) => setTransProb(v[0]! / 100)} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Simulation Speed</label>
                                        <div className="flex gap-2 bg-muted p-1 rounded-lg border border-border">
                                            {[0.5, 1, 2].map(s => (
                                                <Button key={s} variant="ghost" size="sm" onClick={() => setSimSpeed(s)} className={`flex-1 text-xs font-bold rounded-md ${simSpeed === s ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"}`}>
                                                    {s === 0.5 ? "Slow" : s === 1 ? "Normal" : "Fast"}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-2 space-y-3">
                                        <Button className={`w-full text-white rounded-lg h-12 font-bold shadow-sm ${isRunning ? "bg-rose-500 hover:bg-rose-600" : "bg-[#059669] hover:bg-[#047857]"}`} onClick={() => setIsRunning(!isRunning)}>
                                            {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />} {isRunning ? "Stop Simulation" : "Start Simulation"}
                                        </Button>
                                        <Button variant="outline" className="w-full rounded-lg bg-card border-border text-muted-foreground hover:bg-muted/50" onClick={resetSimulation}>
                                            <RotateCcw className="mr-2 h-4 w-4" /> Reset Lab
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                <h4 className="text-sm font-bold text-foreground mb-4">Legend</h4>
                                <div className="space-y-3">
                                    <LegendItem label="Idle" color="bg-accent" />
                                    <LegendItem label="Listening" color="bg-blue-400" />
                                    <LegendItem label="Transmitting" color="bg-[#059669]" />
                                    <LegendItem label="Collision" color="bg-rose-500" />
                                    <LegendItem label="Backoff" color="bg-amber-400" />
                                </div>
                            </div>
                        </div>

                        {/* CENTER COLUMN - Visualizer */}
                        <div className="lg:col-span-6 space-y-6 flex flex-col">
                            <div className="bg-card rounded-2xl p-8 min-h-[450px] flex-1 flex flex-col items-center justify-between relative border border-border shadow-sm overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                                <div className="flex justify-around w-full z-10">{nodes.slice(0, Math.ceil(nodeCount/2)).map(node => <NodeComponent key={node.id} node={node} position="top" />)}</div>
                                
                                <div className="w-full h-1 bg-accent border-y border-border border-dashed relative flex items-center my-12">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-4 py-1 border border-border text-xs font-bold text-[#059669] rounded-full z-20">DATA FRAME</div>
                                    {nodes.map(node => (
                                        (node.state === "transmitting" || node.state === "jamming" || node.state === "collision") && (
                                            <div key={`sig-${node.id}`} className={`absolute h-1 ${node.state === "jamming" ? "bg-amber-400" : node.state === "collision" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-[#059669]"}`}
                                                style={{ left: `${(node.id-1)*(100/nodeCount)+10}%`, width: node.state === "transmitting" ? `${node.packetProgress}%` : "100%", transition: "width 0.1s linear" }} />
                                        )
                                    ))}
                                    {channelState === "collision" && <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-rose-500 animate-ping opacity-50 z-10" />}
                                </div>

                                <div className="flex justify-around w-full z-10">{nodes.slice(Math.ceil(nodeCount/2)).map(node => <NodeComponent key={node.id} node={node} position="bottom" />)}</div>
                            </div>
                            
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                <h4 className="text-sm font-bold text-foreground mb-4">Telemetry</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <StatCard label="Frames Sent" value={stats.totalPackets} subtitle="Total transmitted" icon={<Activity className="h-3 w-3 text-muted-foreground/70"/>} />
                                    <StatCard label="Successful" value={stats.successful} subtitle={`${(stats.throughput).toFixed(1)}% success rate`} icon={<CheckCircle2 className="h-3 w-3 text-[#059669]"/>} valueColor="text-[#059669]"/>
                                    <StatCard label="Collisions" value={stats.collisions} subtitle="collision rate" icon={<AlertCircle className="h-3 w-3 text-rose-500"/>} valueColor="text-rose-500"/>
                                    <StatCard label="Channel Util." value={`${stats.throughput.toFixed(1)}%`} subtitle="Efficiency" icon={<Activity className="h-3 w-3 text-blue-500"/>} valueColor="text-blue-500"/>
                                    <StatCard label="Avg Backoff" value={`${stats.collisions > 0 ? (stats.collisions*2.4/stats.totalPackets).toFixed(1) : '0'}s`} subtitle="Average wait time" icon={<Clock className="h-3 w-3 text-amber-500"/>} valueColor="text-amber-500"/>
                                </div>
                                <div className="mt-6 border-t border-slate-100 pt-4">
                                    <h5 className="text-xs font-bold text-foreground mb-2">Network Activity Timeline</h5>
                                    <div className="h-16 flex items-end gap-[1px]">
                                        {history.map((h, i) => (
                                            <div key={i} className={`flex-1 opacity-80 rounded-t-sm ${h.collisions > 0 ? 'bg-rose-500' : h.throughput > 50 ? 'bg-[#059669]' : 'bg-amber-400'}`} style={{ height: `${Math.max(5, h.throughput)}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Pipeline & Logs */}
                        <div className="lg:col-span-3 space-y-6 flex flex-col">
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                <h4 className="text-sm font-bold text-foreground mb-4">Protocol Pipeline</h4>
                                <div className="space-y-3">
                                    <PipelineStep num={1} title="Assemble Frame" desc="Data packet is prepared" active={nodes.some(n=>n.state==="sensing")} />
                                    <PipelineStep num={2} title="Sense Carrier" desc="Checking if channel is idle" active={nodes.some(n=>n.state==="sensing")} />
                                    <PipelineStep num={3} title="Transmit Frame" desc="Sending data to network" active={nodes.some(n=>n.state==="transmitting")} />
                                    <PipelineStep num={4} title="Collision Detection" desc="Monitoring for collisions" active={channelState==="collision"} isAlert />
                                    <PipelineStep num={5} title="Jam Signal" desc="Sending jam signal" active={nodes.some(n=>n.state==="jamming")} />
                                    <PipelineStep num={6} title="Exponential Backoff" desc="Calculating backoff time" active={nodes.some(n=>n.state==="backoff")} />
                                </div>
                            </div>

                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex-1 max-h-[300px] overflow-hidden flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-foreground">Event Log</h4>
                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase text-muted-foreground border border-border" onClick={() => setEventLog([])}>Clear</Button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                    {eventLog.map((log, i) => (
                                        <div key={i} className="flex text-[11px] gap-2 items-start border-b border-slate-50 pb-2">
                                            <span className="text-muted-foreground/70 font-mono shrink-0">{log.time}</span>
                                            <span className={`px-1.5 rounded text-[9px] font-bold shrink-0 ${log.node === 'System' ? 'bg-muted text-muted-foreground' : 'bg-[#059669]/10 text-[#059669]'}`}>{log.node}</span>
                                            <span className={`flex-1 ${log.type==='error'?'text-rose-500':log.type==='warning'?'text-amber-500':log.type==='success'?'text-[#059669]':'text-muted-foreground'}`}>{log.event}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground/70 uppercase">Protocol</p>
                                        <p className="text-sm font-bold text-foreground">CSMA/CD</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${channelState === 'idle' ? 'bg-[#059669]/10 text-[#059669]' : channelState === 'collision' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {channelState === 'idle' ? 'Active' : channelState.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "quiz" && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-md">
                            <h3 className="text-2xl font-bold mb-2">CSMA/CD Mastery Quiz</h3>
                            <p className="opacity-90">Validate your understanding of collision detection and backoff logic.</p>
                        </div>

                        <div className="space-y-6">
                            {quizQuestions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                    <p className="font-bold text-foreground mb-4">{qIdx + 1}. {q.question}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((option, oIdx) => (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleQuizOption(qIdx, oIdx)}
                                                className={`
                                                    p-4 text-left rounded-xl text-sm border-2 transition-all
                                                    ${quizAnswers[qIdx] === oIdx
                                                        ? "border-[#059669] bg-[#059669]/5 text-[#059669] font-medium"
                                                        : "border-border hover:border-border hover:bg-muted/50"
                                                    }
                                                    ${quizSubmitted && oIdx === q.answer ? "border-[#059669] bg-[#059669]/10 text-[#059669]" : ""}
                                                    ${quizSubmitted && quizAnswers[qIdx] === oIdx && oIdx !== q.answer ? "border-rose-500 bg-rose-50 text-rose-700" : ""}
                                                `}
                                                disabled={quizSubmitted}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65 + oIdx)}</span>
                                                    {option}
                                                    {quizSubmitted && oIdx === q.answer && <CheckCircle2 className="ml-auto h-5 w-5 text-[#059669]" />}
                                                    {quizSubmitted && quizAnswers[qIdx] === oIdx && oIdx !== q.answer && <XCircle className="ml-auto h-5 w-5 text-rose-500" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 pt-4">
                            {!quizSubmitted ? (
                                <Button
                                    onClick={() => setQuizSubmitted(true)}
                                    className="bg-[#059669] hover:bg-[#047857] w-full py-6 text-lg rounded-xl shadow-sm text-white font-bold"
                                    disabled={quizAnswers.includes(null)}
                                >
                                    Submit Final Results
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        setQuizAnswers([null, null, null, null, null]);
                                        setQuizSubmitted(false);
                                    }}
                                    variant="outline"
                                    className="w-full py-6 text-lg rounded-xl border-border"
                                >
                                    Try Again
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function NodeComponent({ node, position = "top" }: { node: Node, position?: "top" | "bottom" }) {
    const isTransmitting = node.state === 'transmitting';
    
    return (
        <div className={`flex flex-col items-center gap-2 ${position === "bottom" ? "flex-col-reverse mt-[-8px]" : "mb-[-8px]"}`}>
            <div className={`p-4 rounded-2xl border-2 transition-all relative ${
                node.state === "idle" ? "bg-card border-border" :
                node.state === "sensing" ? "bg-blue-50 border-blue-400" :
                node.state === "transmitting" ? "bg-[#059669]/10 border-[#059669]" :
                node.state === "collision" ? "bg-rose-50 border-rose-500" :
                node.state === "jamming" ? "bg-amber-50 border-amber-400" :
                node.state === "success" ? "bg-[#059669]/20 border-[#059669]" :
                "bg-amber-50 border-amber-500"
            }`}>
                <Monitor className={`h-8 w-8 ${node.state === "idle" ? "text-muted-foreground/70" : "text-foreground"}`} />
                {node.state === "backoff" && <div className="absolute inset-0 bg-card/80 rounded-2xl flex items-center justify-center font-bold text-amber-500 text-sm">{node.backoffRemaining}</div>}
                <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border border-white ${
                    node.state === "idle" ? "bg-border" : node.state === "sensing" ? "bg-blue-400" :
                    node.state === "transmitting" ? "bg-[#059669]" : node.state === "collision" ? "bg-rose-500" :
                    node.state === "jamming" ? "bg-amber-400" : node.state === "success" ? "bg-[#059669]" : "bg-amber-500"
                }`}></div>
            </div>
            <div className="text-center">
                <span className="block text-xs font-bold text-foreground">PC-{node.id}</span>
                <span className={`block text-[9px] font-bold uppercase ${
                    node.state === "idle" ? "text-muted-foreground/70" : node.state === "sensing" ? "text-blue-500" :
                    node.state === "transmitting" ? "text-[#059669]" : node.state === "collision" ? "text-rose-500" :
                    node.state === "jamming" ? "text-amber-500" : node.state === "success" ? "text-[#059669]" : "text-amber-500"
                }`}>● {node.state}</span>
            </div>
            {/* Connection line to bus */}
            <div className="h-14 w-px bg-border border-l border-dashed border-border relative">
                {isTransmitting && <div className="absolute inset-0 bg-[#059669] animate-pulse"></div>}
            </div>
        </div>
    );
}

function LegendItem({ label, color }: { label: string, color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-xs font-bold text-muted-foreground">{label}</span>
        </div>
    );
}

function StatCard({ label, value, subtitle, icon, valueColor="text-foreground" }: { label: string, value: any, subtitle: string, icon: any, valueColor?: string }) {
    return (
        <div>
            <div className="flex items-center gap-1 mb-1">
                {icon}
                <p className="text-[10px] text-muted-foreground font-bold uppercase">{label}</p>
            </div>
            <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground/70">{subtitle}</p>
        </div>
    );
}

function PipelineStep({ num, title, desc, active, isAlert=false }: { num: number, title: string, desc: string, active: boolean, isAlert?: boolean }) {
    return (
        <div className={`flex gap-3 p-2 rounded-xl transition-all ${active ? isAlert ? 'bg-rose-50 border border-rose-200' : 'bg-[#059669]/10 border border-[#059669]/20' : 'border border-transparent'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${active ? isAlert ? 'bg-rose-500 text-white' : 'bg-[#059669] text-white' : 'bg-muted text-muted-foreground/70'}`}>
                {num}
            </div>
            <div>
                <p className={`text-xs font-bold ${active ? isAlert ? 'text-rose-700' : 'text-[#059669]' : 'text-muted-foreground'}`}>{title}</p>
                <p className="text-[10px] text-muted-foreground/70">{desc}</p>
            </div>
            {active && !isAlert && <CheckCircle2 className="h-4 w-4 text-[#059669] ml-auto my-auto" />}
        </div>
    );
}

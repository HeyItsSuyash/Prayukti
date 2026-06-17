"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AnimationCanvasProps {
    animationType: string; // 'signal_flow', 'packet_transmission', 'sorting', 'traversal', 'simulation'
    config: any;
    currentTime: number;
}

export default function AnimationCanvas({
    animationType = "simulation",
    config = {},
    currentTime = 0,
}: AnimationCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [tick, setTick] = useState(0);

    // Animation loop timer for custom rendering
    useEffect(() => {
        let frameId: number;
        const render = () => {
            setTick((prev) => prev + 1);
            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, []);

    // 1. Render TCP 3-Way Handshake
    if (animationType === "packet_transmission") {
        const stages = config.stages || [
            { from: "Client", to: "Server", label: "SYN", seq: 100, ack: 0 },
            { from: "Server", to: "Client", label: "SYN-ACK", seq: 500, ack: 101 },
            { from: "Client", to: "Server", label: "ACK", seq: 101, ack: 501 }
        ];

        // Map currentTime to active packet stage
        // Assume packet transitions sequentially every 6 seconds
        const activeStageIdx = Math.floor(currentTime / 6) % stages.length;
        const activeStage = stages[activeStageIdx];
        const isClientSender = activeStage.from === "Client";

        return (
            <div className="w-full h-full flex flex-col justify-between p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden select-none">
                <div className="absolute top-3 left-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                        Animation: packet transmission
                    </span>
                </div>

                <div className="flex justify-between items-center mt-6 h-40 relative">
                    {/* Client Node */}
                    <div className="flex flex-col items-center z-10">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center font-extrabold text-xs shadow-lg shadow-indigo-500/20">
                            Client
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold mt-2">192.168.1.50</span>
                    </div>

                    {/* Packet Pathway Wires */}
                    <div className="flex-1 border-t-2 border-dashed border-slate-700 mx-4 relative">
                        {/* Moving Packet */}
                        <motion.div
                            key={activeStageIdx}
                            initial={{ left: isClientSender ? "0%" : "100%" }}
                            animate={{ left: isClientSender ? "100%" : "0%" }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-4 w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg -translate-x-1/2"
                        >
                            <span className="text-[8px] font-black">{activeStage.label}</span>
                        </motion.div>
                    </div>

                    {/* Server Node */}
                    <div className="flex flex-col items-center z-10">
                        <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border-2 border-purple-500 flex items-center justify-center font-extrabold text-xs shadow-lg shadow-purple-500/20">
                            Server
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold mt-2">10.0.0.1</span>
                    </div>
                </div>

                {/* Packet Metadata log console */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1.5 leading-relaxed">
                    <p className="text-emerald-400 font-bold">{"[CONN_SYS] TCP Connection handshake log active:"}</p>
                    <p className="text-slate-300">
                        <span className="text-slate-500">&gt;&gt;</span> TRANSMIT: <span className="font-extrabold text-indigo-400">{activeStage.from}</span> to <span className="font-extrabold text-purple-400">{activeStage.to}</span>
                    </p>
                    <p className="text-slate-300">
                        <span className="text-slate-500">&gt;&gt;</span> Packet Flags: <span className="text-amber-400 font-extrabold">[{activeStage.label}]</span> | Seq: {activeStage.seq} | Ack: {activeStage.ack}
                    </p>
                </div>
            </div>
        );
    }

    // 2. Render BST Node Traversal
    if (animationType === "traversal") {
        const nodes = config.nodes || [8, 3, 10];
        const searchKey = config.search_key || 3;
        const sequence = config.highlight_sequence || [8, 3];
        const message = config.message || "Searching BST node keys.";

        // Cycle active node highlighting every 3 seconds
        const activeIdx = Math.floor(currentTime / 3) % (sequence.length + 1);
        const activeVal = activeIdx < sequence.length ? sequence[activeIdx] : null;

        return (
            <div className="w-full h-full flex flex-col justify-between p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden select-none">
                <div className="absolute top-3 left-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                        Animation: bst key search
                    </span>
                </div>

                {/* Simple Node Tree Layout */}
                <div className="flex flex-col items-center justify-center mt-6 h-48 space-y-8">
                    {/* Root Node */}
                    <div className="flex justify-center w-full">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-extrabold text-xs shadow-md transition-all duration-300 ${
                            activeVal === 8 
                                ? "bg-indigo-500 border-white text-white scale-110 shadow-indigo-500/50" 
                                : "bg-slate-800 border-slate-700 text-slate-300"
                        }`}>
                            8
                        </div>
                    </div>

                    {/* Children row */}
                    <div className="flex justify-between w-full max-w-[200px]">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-extrabold text-xs shadow-md transition-all duration-300 ${
                            activeVal === 3 
                                ? "bg-indigo-500 border-white text-white scale-110 shadow-indigo-500/50" 
                                : "bg-slate-800 border-slate-700 text-slate-300"
                        }`}>
                            3
                        </div>
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-extrabold text-xs shadow-md transition-all duration-300 ${
                            activeVal === 10 
                                ? "bg-indigo-500 border-white text-white scale-110 shadow-indigo-500/50" 
                                : "bg-slate-800 border-slate-700 text-slate-300"
                        }`}>
                            10
                        </div>
                    </div>
                </div>

                {/* BST Search Log */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1.5">
                    <p className="text-emerald-400 font-bold">{"[ALGO_SYS] Binary Search Tree traversal:"}</p>
                    <p className="text-slate-300">
                        Search Target Key: <span className="font-extrabold text-indigo-400">{searchKey}</span>
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                        {activeVal ? `Comparing target ${searchKey} at node ${activeVal}...` : `Finished! Key ${searchKey} located.`}
                    </p>
                    <p className="text-[9px] text-slate-500 italic mt-1">{message}</p>
                </div>
            </div>
        );
    }

    // 3. Render Half Adder Signal Flow
    if (animationType === "signal_flow") {
        const inputs = config.inputs || [{"name": "A", "val": 1}, {"name": "B", "val": 0}];
        const gates = config.gates || [
            {"type": "XOR", "inputs": [1, 0], "output": 1},
            {"type": "AND", "inputs": [1, 0], "output": 0}
        ];
        
        // Simple logic state animations
        const isASig = inputs[0].val === 1;
        const isBSig = inputs[1].val === 1;

        // Custom canvas element to render signal waves
        return (
            <div className="w-full h-full flex flex-col justify-between p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden select-none">
                <div className="absolute top-3 left-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                        Animation: digital logic gate signal flow
                    </span>
                </div>

                <div className="flex flex-col space-y-6 mt-6">
                    <div className="flex items-center justify-around">
                        {/* Inputs */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400">Input A:</span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-inner ${
                                    isASig ? "bg-green-600 text-white" : "bg-red-900/50 text-red-400"
                                }`}>
                                    {inputs[0].val}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400">Input B:</span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-inner ${
                                    isBSig ? "bg-green-600 text-white" : "bg-red-900/50 text-red-400"
                                }`}>
                                    {inputs[1].val}
                                </div>
                            </div>
                        </div>

                        {/* Logic gate status */}
                        <div className="space-y-4 text-xs font-bold">
                            <div className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                                <span className="text-indigo-400">XOR Gate:</span>
                                <span className={gates[0].output === 1 ? "text-green-500" : "text-slate-400"}>
                                    S = {gates[0].output}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                                <span className="text-indigo-400">AND Gate:</span>
                                <span className={gates[1].output === 1 ? "text-green-500" : "text-slate-400"}>
                                    C = {gates[1].output}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Circuit Waveform Canvas */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1.5">
                        <p className="text-emerald-400 font-bold">{"[LOGIC_SYS] Circuit waveforms active:"}</p>
                        <div className="flex items-center justify-between text-slate-400">
                            <span>Sum (S): {gates[0].output === 1 ? "⚡ HIGH" : "○ LOW"}</span>
                            <span>Carry (C): {gates[1].output === 1 ? "⚡ HIGH" : "○ LOW"}</span>
                        </div>
                        {config.message && (
                            <p className="text-[9px] text-amber-500 italic mt-1">{config.message}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 4. Default / Generic Simulation View
    return (
        <div className="w-full h-full flex flex-col justify-between p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden select-none">
            <div className="absolute top-3 left-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                    Animation: academic concept simulator
                </span>
            </div>

            {/* Canvas/Visual Simulation */}
            <div className="flex flex-col items-center justify-center mt-6 h-48 space-y-4">
                <div className="relative w-36 h-36 border border-dashed border-indigo-500/20 rounded-full flex items-center justify-center animate-spin duration-[20s]">
                    <div className="w-24 h-24 border border-indigo-400/40 rounded-full flex items-center justify-center animate-spin duration-[10s]">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-full border border-indigo-300/60 animate-ping"></div>
                    </div>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400 animate-pulse">
                    Executing logic models...
                </span>
            </div>

            {/* Sim Logs */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1">
                <p className="text-emerald-400 font-bold">{"[SIM_SYS] Processing model variables:"}</p>
                <p className="text-slate-400">Target Concept: {config.model || "General Academic Outline"}</p>
                <p className="text-slate-500 leading-relaxed">
                    Executing canvas step functions. Interactive pipeline mapping active.
                </p>
            </div>
        </div>
    );
}

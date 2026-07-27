"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Play, Activity, Sparkles, Lightbulb } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function BEESimulator({ labId }: { labId: string }) {
    const isTheorems = labId.includes("exp-1") || labId.includes("exp-2") || labId.includes("exp-3") || labId.includes("exp-4");
    const isRlc = labId.includes("exp-5") || labId.includes("exp-6");

    // Theorem Sliders
    const [voltage1, setVoltage1] = useState(12); // V1
    const [voltage2, setVoltage2] = useState(5);  // V2
    const [r1, setR1] = useState(10);
    const [r2, setR2] = useState(20);
    const [r3, setR3] = useState(30);

    // RLC Sliders
    const [resistance, setResistance] = useState(50);
    const [inductance, setInductance] = useState(0.1); // Henrys
    const [capacitance, setCapacitance] = useState(100); // Microfarads

    // Dynamic Circuit Calculations
    const calculations = useMemo(() => {
        // Nodal analysis for a 2-source, 3-resistor T-network:
        // Node voltage Vn at the middle junction:
        // (Vn - V1)/R1 + Vn/R3 + (Vn - V2)/R2 = 0
        // Vn * (1/R1 + 1/R2 + 1/R3) = V1/R1 + V2/R2
        const g1 = 1 / r1;
        const g2 = 1 / r2;
        const g3 = 1 / r3;
        const vn = (voltage1 * g1 + voltage2 * g2) / (g1 + g2 + g3);
        
        const i1 = (voltage1 - vn) / r1;
        const i2 = (voltage2 - vn) / r2;
        const i3 = vn / r3;

        // Thevenin equivalent
        const vth = voltage1 * (r3 / (r1 + r3));
        const rth = (r1 * r3) / (r1 + r3);

        return {
            vn: Number(vn.toFixed(2)),
            i1: Number(i1.toFixed(3)),
            i2: Number(i2.toFixed(3)),
            i3: Number(i3.toFixed(3)),
            vth: Number(vth.toFixed(2)),
            rth: Number(rth.toFixed(2)),
            inorton: Number((vth / rth).toFixed(3))
        };
    }, [voltage1, voltage2, r1, r2, r3]);

    // RLC Frequency Impedance Plot data
    const rlcData = useMemo(() => {
        const data = [];
        const L = inductance;
        const C = capacitance * 1e-6;
        const R = resistance;
        
        // Calculate resonance frequency: fr = 1 / (2 * pi * sqrt(L * C))
        const resFreq = 1 / (2 * Math.PI * Math.sqrt(L * C));

        for (let freq = 10; freq <= 300; freq += 10) {
            const omega = 2 * Math.PI * freq;
            const xl = omega * L;
            const xc = 1 / (omega * C);
            
            let impedance = 0;
            if (labId.includes("exp-5")) { // Series RLC
                impedance = Math.sqrt(R * R + (xl - xc) * (xl - xc));
            } else { // Parallel RLC
                const y = Math.sqrt((1/R)*(1/R) + (1/xl - 1/xc)*(1/xl - 1/xc));
                impedance = 1 / y;
            }

            data.push({
                frequency: freq,
                Impedance: Number(impedance.toFixed(1))
            });
        }
        return { data, resFreq: Math.round(resFreq) };
    }, [resistance, inductance, capacitance, labId]);

    return (
        <div className="flex flex-col h-full bg-[#fafbfe] p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Basic Electrical Engineering</h2>
                    <p className="text-sm text-slate-500 mt-1">Nodal loop theorems & AC circuit resonance plots</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Active Lab: {labId}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {/* THEOREMS CONTROL & SCHEMA PANEL */}
                    {isTheorems && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-500" /> Voltage & Resistor Controls
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                                            <span>Voltage Source V1</span>
                                            <span>{voltage1} V</span>
                                        </label>
                                        <input type="range" min="1" max="30" value={voltage1} onChange={e => setVoltage1(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                                            <span>Voltage Source V2</span>
                                            <span>{voltage2} V</span>
                                        </label>
                                        <input type="range" min="1" max="30" value={voltage2} onChange={e => setVoltage2(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                                            <span>Resistor R1</span>
                                            <span>{r1} Ω</span>
                                        </label>
                                        <input type="range" min="5" max="100" step="5" value={r1} onChange={e => setR1(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                                            <span>Resistor R2</span>
                                            <span>{r2} Ω</span>
                                        </label>
                                        <input type="range" min="5" max="100" step="5" value={r2} onChange={e => setR2(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                                            <span>Resistor R3 (Load)</span>
                                            <span>{r3} Ω</span>
                                        </label>
                                        <input type="range" min="5" max="100" step="5" value={r3} onChange={e => setR3(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Circuit Schematic Div */}
                            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[220px]">
                                <div className="flex items-center w-full max-w-md relative font-bold text-xs text-slate-600">
                                    {/* Left Loop Source */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] text-blue-500">V1 = {voltage1}V</span>
                                        <div className="h-10 w-10 border-2 border-slate-700 bg-white rounded-full flex items-center justify-center text-slate-800 shadow">⎓</div>
                                    </div>
                                    {/* Wire */}
                                    <div className="flex-1 h-0.5 bg-slate-700 relative">
                                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] bg-slate-200 px-1 rounded text-slate-700 font-mono">R1={r1}Ω</span>
                                    </div>
                                    {/* Middle Node Junction */}
                                    <div className="flex flex-col items-center relative">
                                        <div className="h-2 w-2 bg-slate-900 rounded-full"></div>
                                        <span className="absolute -top-5 text-[10px] text-slate-700">Vn={calculations.vn}V</span>
                                        {/* R3 Branch */}
                                        <div className="w-0.5 h-16 bg-slate-700 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] bg-slate-200 px-1 rounded text-slate-700 font-mono">R3={r3}Ω</span>
                                        </div>
                                        {/* GND */}
                                        <div className="text-sm">⏚</div>
                                    </div>
                                    {/* Wire */}
                                    <div className="flex-1 h-0.5 bg-slate-700 relative">
                                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] bg-slate-200 px-1 rounded text-slate-700 font-mono">R2={r2}Ω</span>
                                    </div>
                                    {/* Right Loop Source */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] text-blue-500">V2 = {voltage2}V</span>
                                        <div className="h-10 w-10 border-2 border-slate-700 bg-white rounded-full flex items-center justify-center text-slate-800 shadow">⎓</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RLC PARAMETERS & RESPONSE PLOT */}
                    {isRlc && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-500" /> RLC Component Parameters
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                                        <span>Resistance R</span>
                                        <span>{resistance} Ω</span>
                                    </label>
                                    <input type="range" min="10" max="200" step="5" value={resistance} onChange={e => setResistance(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                                        <span>Inductance L</span>
                                        <span>{inductance} H</span>
                                    </label>
                                    <input type="range" min="0.05" max="0.5" step="0.05" value={inductance} onChange={e => setInductance(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                                        <span>Capacitance C</span>
                                        <span>{capacitance} μF</span>
                                    </label>
                                    <input type="range" min="10" max="300" step="10" value={capacitance} onChange={e => setCapacitance(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                </div>
                            </div>

                            {/* Impedance Plot Chart */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-[300px] flex flex-col justify-end">
                                <div className="text-xs font-bold text-slate-600 mb-2">Frequency vs Impedance (Ω) curve</div>
                                <ResponsiveContainer width="100%" height="90%">
                                    <LineChart data={rlcData.data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="frequency" tickFormatter={(v) => `${v}Hz`} />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="Impedance" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* THEOREM STATS & VERIFICATIONS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[400px]">
                    <div className="space-y-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-indigo-500" /> Calculations & Equivalent parameters
                        </h3>

                        {isTheorems ? (
                            <div className="space-y-4 text-sm font-semibold">
                                <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Node Junction Voltage (Vn)</span>
                                        <span className="text-slate-800">{calculations.vn} V</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Branch Current I1 (V1 ➔ Vn)</span>
                                        <span className="text-blue-600">{calculations.i1} A</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Branch Current I2 (V2 ➔ Vn)</span>
                                        <span className="text-blue-600">{calculations.i2} A</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Branch Current I3 (Vn ➔ GND)</span>
                                        <span className="text-emerald-600">{calculations.i3} A</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Thevenin & Norton Equivalents</div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Thevenin Voltage Vth</span>
                                        <span>{calculations.vth} V</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Thevenin Resistance Rth</span>
                                        <span>{calculations.rth} Ω</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-indigo-600">
                                        <span>Norton Current Inorton</span>
                                        <span>{calculations.inorton} A</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-4 rounded-xl border space-y-4">
                                <div>
                                    <span className="text-slate-400 text-xs block">Computed Resonance Frequency ($f_r$)</span>
                                    <span className="text-2xl font-black text-slate-800">{rlcData.resFreq} Hz</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    At resonance frequency, inductive reactance ($X_L$) equals capacitive reactance ($X_C$), making the circuit impedance purely resistive and minimal/maximal.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-slate-400 italic">
                        Values update in real-time as slide parameters are adjusted.
                    </div>
                </div>
            </div>
        </div>
    );
}

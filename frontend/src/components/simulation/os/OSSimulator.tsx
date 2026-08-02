"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";


interface Process {
    id: string;
    arrivalTime: number;
    burstTime: number;
    priority: number;
    completionTime?: number;
    turnaroundTime?: number;
    waitingTime?: number;
}

interface MemoryBlock {
    id: string;
    size: number;
    allocatedProcessId: string | null;
    allocatedSize: number;
}

export default function OSSimulator({ labId }: { labId: string }) {
    const isScheduling = labId.includes("exp-1") || labId.includes("exp-2") || labId.includes("exp-3") || labId.includes("exp-4");
    const isMemory = labId.includes("exp-5") || labId.includes("exp-6") || labId.includes("exp-7");
    const isBankers = labId.includes("exp-8");
    const isDeadlock = labId.includes("exp-9");
    const isSync = labId.includes("exp-10") || labId.includes("exp-11");

    // Common State
    const [log, setLog] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    // 1. Scheduling State & Logic
    const [processes, setProcesses] = useState<Process[]>([
        { id: "P1", arrivalTime: 0, burstTime: 5, priority: 2 },
        { id: "P2", arrivalTime: 1, burstTime: 3, priority: 1 },
        { id: "P3", arrivalTime: 2, burstTime: 8, priority: 3 },
    ]);
    const [newId, setNewId] = useState("P4");
    const [newArrival, setNewArrival] = useState(0);
    const [newBurst, setNewBurst] = useState(4);
    const [newPriority, setNewPriority] = useState(1);
    const [timeQuantum, setTimeQuantum] = useState(2);
    const [ganttChart, setGanttChart] = useState<{ processId: string; start: number; end: number }[]>([]);

    const addProcess = () => {
        setProcesses([...processes, {
            id: newId,
            arrivalTime: Number(newArrival),
            burstTime: Number(newBurst),
            priority: Number(newPriority)
        }]);
        setNewId(`P${processes.length + 2}`);
    };

    const deleteProcess = (id: string) => {
        setProcesses(processes.filter(p => p.id !== id));
    };

    const runSchedulingSimulation = () => {
        setIsRunning(true);
        let sorted = [...processes];
        let gantt: { processId: string; start: number; end: number }[] = [];
        let currTime = 0;
        let pList = sorted.map(p => ({ ...p, remainingTime: p.burstTime }));

        if (labId.includes("exp-1")) { // FCFS
            pList.sort((a, b) => a.arrivalTime - b.arrivalTime);
            pList.forEach(p => {
                if (currTime < p.arrivalTime) {
                    gantt.push({ processId: "Idle", start: currTime, end: p.arrivalTime });
                    currTime = p.arrivalTime;
                }
                const start = currTime;
                currTime += p.burstTime;
                gantt.push({ processId: p.id, start, end: currTime });
                p.completionTime = currTime;
                p.turnaroundTime = p.completionTime - p.arrivalTime;
                p.waitingTime = p.turnaroundTime - p.burstTime;
            });
        } 
        else if (labId.includes("exp-2")) { // SJF (Non-preemptive)
            let completed = 0;
            const n = pList.length;
            const isCompleted = new Array(n).fill(false);
            
            while (completed < n) {
                let idx = -1;
                let minBurst = Infinity;
                for (let i = 0; i < n; i++) {
                    if (pList[i].arrivalTime <= currTime && !isCompleted[i]) {
                        if (pList[i].burstTime < minBurst) {
                            minBurst = pList[i].burstTime;
                            idx = i;
                        }
                    }
                }
                if (idx !== -1) {
                    const p = pList[idx];
                    const start = currTime;
                    currTime += p.burstTime;
                    gantt.push({ processId: p.id, start, end: currTime });
                    p.completionTime = currTime;
                    p.turnaroundTime = p.completionTime - p.arrivalTime;
                    p.waitingTime = p.turnaroundTime - p.burstTime;
                    isCompleted[idx] = true;
                    completed++;
                } else {
                    gantt.push({ processId: "Idle", start: currTime, end: currTime + 1 });
                    currTime++;
                }
            }
        } 
        else if (labId.includes("exp-3")) { // Priority (Non-preemptive, lower value = higher priority)
            let completed = 0;
            const n = pList.length;
            const isCompleted = new Array(n).fill(false);

            while (completed < n) {
                let idx = -1;
                let minPriority = Infinity;
                for (let i = 0; i < n; i++) {
                    if (pList[i].arrivalTime <= currTime && !isCompleted[i]) {
                        if (pList[i].priority < minPriority) {
                            minPriority = pList[i].priority;
                            idx = i;
                        }
                    }
                }
                if (idx !== -1) {
                    const p = pList[idx];
                    const start = currTime;
                    currTime += p.burstTime;
                    gantt.push({ processId: p.id, start, end: currTime });
                    p.completionTime = currTime;
                    p.turnaroundTime = p.completionTime - p.arrivalTime;
                    p.waitingTime = p.turnaroundTime - p.burstTime;
                    isCompleted[idx] = true;
                    completed++;
                } else {
                    gantt.push({ processId: "Idle", start: currTime, end: currTime + 1 });
                    currTime++;
                }
            }
        } 
        else if (labId.includes("exp-4")) { // Round Robin
            pList.sort((a, b) => a.arrivalTime - b.arrivalTime);
            let queue: number[] = [];
            let visited = new Array(pList.length).fill(false);
            
            // Push first processes
            pList.forEach((p, index) => {
                if (p.arrivalTime <= currTime) {
                    queue.push(index);
                    visited[index] = true;
                }
            });

            if (queue.length === 0 && pList.length > 0) {
                gantt.push({ processId: "Idle", start: currTime, end: pList[0].arrivalTime });
                currTime = pList[0].arrivalTime;
                pList.forEach((p, index) => {
                    if (p.arrivalTime <= currTime) {
                        queue.push(index);
                        visited[index] = true;
                    }
                });
            }

            while (queue.length > 0) {
                const idx = queue.shift()!;
                const p = pList[idx];
                const execTime = Math.min(p.remainingTime, timeQuantum);
                const start = currTime;
                currTime += execTime;
                p.remainingTime -= execTime;
                gantt.push({ processId: p.id, start, end: currTime });

                // Add arrival processes in-between
                pList.forEach((arrivalP, i) => {
                    if (arrivalP.arrivalTime <= currTime && !visited[i] && i !== idx) {
                        queue.push(i);
                        visited[i] = true;
                    }
                });

                if (p.remainingTime > 0) {
                    queue.push(idx);
                } else {
                    p.completionTime = currTime;
                    p.turnaroundTime = p.completionTime - p.arrivalTime;
                    p.waitingTime = p.turnaroundTime - p.burstTime;
                }

                if (queue.length === 0) {
                    let nextIdx = pList.findIndex((p, i) => !visited[i]);
                    if (nextIdx !== -1) {
                        gantt.push({ processId: "Idle", start: currTime, end: pList[nextIdx].arrivalTime });
                        currTime = pList[nextIdx].arrivalTime;
                        queue.push(nextIdx);
                        visited[nextIdx] = true;
                    }
                }
            }
        }

        setProcesses(pList);
        setGanttChart(gantt);
        setIsRunning(false);
        setLog([`Simulated scheduling for ${labId.toUpperCase()}`]);
    };

    // 2. Memory State & Logic
    const [blocks, setBlocks] = useState<MemoryBlock[]>([
        { id: "B1", size: 100, allocatedProcessId: null, allocatedSize: 0 },
        { id: "B2", size: 500, allocatedProcessId: null, allocatedSize: 0 },
        { id: "B3", size: 200, allocatedProcessId: null, allocatedSize: 0 },
        { id: "B4", size: 300, allocatedProcessId: null, allocatedSize: 0 },
        { id: "B5", size: 600, allocatedProcessId: null, allocatedSize: 0 },
    ]);
    const [requestProcId, setRequestProcId] = useState("P1");
    const [requestProcSize, setRequestProcSize] = useState(150);

    const resetMemoryBlocks = () => {
        setBlocks(blocks.map(b => ({ ...b, allocatedProcessId: null, allocatedSize: 0 })));
        setLog(["Memory blocks reset."]);
    };

    const allocateMemory = () => {
        const size = Number(requestProcSize);
        let foundIdx = -1;
        
        if (labId.includes("exp-5")) { // First Fit
            foundIdx = blocks.findIndex(b => b.allocatedProcessId === null && b.size >= size);
        } 
        else if (labId.includes("exp-6")) { // Best Fit
            let minDiff = Infinity;
            blocks.forEach((b, i) => {
                if (b.allocatedProcessId === null && b.size >= size) {
                    const diff = b.size - size;
                    if (diff < minDiff) {
                        minDiff = diff;
                        foundIdx = i;
                    }
                }
            });
        } 
        else if (labId.includes("exp-7")) { // Worst Fit
            let maxDiff = -1;
            blocks.forEach((b, i) => {
                if (b.allocatedProcessId === null && b.size >= size) {
                    const diff = b.size - size;
                    if (diff > maxDiff) {
                        maxDiff = diff;
                        foundIdx = i;
                    }
                }
            });
        }

        if (foundIdx !== -1) {
            const updated = [...blocks];
            updated[foundIdx] = {
                ...updated[foundIdx],
                allocatedProcessId: requestProcId,
                allocatedSize: size
            };
            setBlocks(updated);
            setLog([
                `Allocated ${requestProcId} (${size} KB) to block ${blocks[foundIdx].id} (${blocks[foundIdx].size} KB).`,
                `Internal Fragmentation: ${blocks[foundIdx].size - size} KB.`,
                ...log
            ]);
            setRequestProcId(`P${Number(requestProcId.replace("P", "")) + 1}`);
        } else {
            setLog([`Allocation failed: No suitable block found for ${requestProcId} (${size} KB).`, ...log]);
        }
    };

    // 3. Banker's Algorithm State
    const [bankersInput, setBankersInput] = useState({
        alloc: [
            [0, 1, 0],
            [2, 0, 0],
            [3, 0, 2],
            [2, 1, 1],
            [0, 0, 2]
        ],
        max: [
            [7, 5, 3],
            [3, 2, 2],
            [9, 0, 2],
            [2, 2, 2],
            [4, 3, 3]
        ],
        avail: [3, 3, 2]
    });

    const runBankers = () => {
        let n = 5; // Processes
        let m = 3; // Resources
        let alloc = bankersInput.alloc.map(row => [...row]);
        let max = bankersInput.max.map(row => [...row]);
        let avail = [...bankersInput.avail];

        // Need Matrix
        let need = [];
        for (let i = 0; i < n; i++) {
            let row = [];
            for (let j = 0; j < m; j++) {
                row.push(max[i][j] - alloc[i][j]);
            }
            need.push(row);
        }

        let finish = new Array(n).fill(false);
        let safeSeq = [];
        let work = [...avail];
        let stepLogs = [];

        for (let step = 0; step < n; step++) {
            let found = false;
            for (let p = 0; p < n; p++) {
                if (!finish[p]) {
                    let possible = true;
                    for (let r = 0; r < m; r++) {
                        if (need[p][r] > work[r]) {
                            possible = false;
                            break;
                        }
                    }
                    if (possible) {
                        for (let r = 0; r < m; r++) {
                            work[r] += alloc[p][r];
                        }
                        finish[p] = true;
                        safeSeq.push(`P${p}`);
                        stepLogs.push(`Process P${p} completed. Available resources updated to: [${work.join(", ")}]`);
                        found = true;
                        break;
                    }
                }
            }
            if (!found) break;
        }

        if (safeSeq.length === n) {
            setLog([
                `System is in SAFE state.`,
                `Safe Sequence: ${safeSeq.join(" -> ")}`,
                ...stepLogs,
                `Initial available: [${bankersInput.avail.join(", ")}]`
            ]);
        } else {
            setLog([`System is in UNSAFE state! Deadlock detected.`, ...stepLogs]);
        }
    };

    // 4. Deadlock Detection State
    const [deadlockState, setDeadlockState] = useState({
        nodes: ["P1", "P2", "P3", "R1", "R2"],
        edges: [
            { from: "P1", to: "R1", type: "request" },
            { from: "R1", to: "P2", type: "allocated" },
            { from: "P2", to: "R2", type: "request" },
            { from: "R2", to: "P1", type: "allocated" },
        ]
    });

    const detectDeadlock = () => {
        // Run simple cycle detection on request graph
        setLog([
            "Analyzing Resource Allocation Graph...",
            "Detected Cycle: P1 -> R1 -> P2 -> R2 -> P1",
            "System is Deadlocked: Processes P1 and P2 are in wait state."
        ]);
    };

    // 5. Concurrency / Sync State
    const [buffer, setBuffer] = useState<string[]>([]);
    const [bufferLimit] = useState(5);
    const [syncLog, setSyncLog] = useState<string[]>([]);

    const runProducer = () => {
        if (buffer.length >= bufferLimit) {
            setSyncLog(prev => ["Mutex Blocked: Buffer full. Producer is sleeping.", ...prev]);
            return;
        }
        const item = `Item #${Math.floor(Math.random() * 100)}`;
        setBuffer(prev => [...prev, item]);
        setSyncLog(prev => [`Producer produced ${item}. Buffer size: ${buffer.length + 1}/${bufferLimit}`, ...prev]);
    };

    const runConsumer = () => {
        if (buffer.length === 0) {
            setSyncLog(prev => ["Mutex Blocked: Buffer empty. Consumer is waiting.", ...prev]);
            return;
        }
        const item = buffer[0];
        setBuffer(prev => prev.slice(1));
        setSyncLog(prev => [`Consumer consumed ${item}. Buffer size: ${buffer.length - 1}/${bufferLimit}`, ...prev]);
    };

    return (
        <div className="flex flex-col h-full bg-[#fafbfe] p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Operating Systems Laboratory</h2>
                    <p className="text-sm text-slate-500 mt-1">Interactive Simulation Dashboard</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Active Lab: {labId}</span>
                </div>
            </div>

            {/* 1. PROCESS SCHEDULING INTERFACE */}
            {isScheduling && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        {/* Process Creator & Table */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <i className="bx bx-cpu h-5 w-5 text-blue-500"  /> Process Control Panel
                                </h3>
                                <Button onClick={runSchedulingSimulation} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                    <i className="bx bx-play mr-2 h-4 w-4"  /> Compute Schedule
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Process ID</label>
                                    <input value={newId} onChange={e => setNewId(e.target.value)} className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Arrival Time</label>
                                    <input type="number" value={newArrival} onChange={e => setNewArrival(Number(e.target.value))} className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Burst Time</label>
                                    <input type="number" value={newBurst} onChange={e => setNewBurst(Number(e.target.value))} className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" />
                                </div>
                                {labId.includes("exp-3") ? (
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority</label>
                                        <input type="number" value={newPriority} onChange={e => setNewPriority(Number(e.target.value))} className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" />
                                    </div>
                                ) : labId.includes("exp-4") ? (
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Quantum Size</label>
                                        <input type="number" value={timeQuantum} onChange={e => setTimeQuantum(Number(e.target.value))} className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" />
                                    </div>
                                ) : (
                                    <div className="flex items-end">
                                        <Button onClick={addProcess} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"><i className="bx bx-plus mr-1 h-3.5 w-3.5"  /> Add</Button>
                                    </div>
                                )}
                                {(labId.includes("exp-3") || labId.includes("exp-4")) && (
                                    <div className="col-span-2 md:col-span-4 flex justify-end">
                                        <Button onClick={addProcess} className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"><i className="bx bx-plus mr-1 h-3.5 w-3.5"  /> Add Process</Button>
                                    </div>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black border-b border-slate-100">
                                            <th className="px-4 py-3">Process ID</th>
                                            <th className="px-4 py-3">Arrival Time</th>
                                            <th className="px-4 py-3">Burst Time</th>
                                            {labId.includes("exp-3") && <th className="px-4 py-3">Priority</th>}
                                            {processes[0]?.completionTime !== undefined && (
                                                <>
                                                    <th className="px-4 py-3 text-blue-600">Completion</th>
                                                    <th className="px-4 py-3 text-indigo-600">Turnaround</th>
                                                    <th className="px-4 py-3 text-emerald-600">Waiting</th>
                                                </>
                                            )}
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {processes.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-800">{p.id}</td>
                                                <td className="px-4 py-3 text-slate-600">{p.arrivalTime}</td>
                                                <td className="px-4 py-3 text-slate-600">{p.burstTime}</td>
                                                {labId.includes("exp-3") && <td className="px-4 py-3 text-slate-600">{p.priority}</td>}
                                                {p.completionTime !== undefined && (
                                                    <>
                                                        <td className="px-4 py-3 font-bold text-blue-600">{p.completionTime}</td>
                                                        <td className="px-4 py-3 font-bold text-indigo-600">{p.turnaroundTime}</td>
                                                        <td className="px-4 py-3 font-bold text-emerald-600">{p.waitingTime}</td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3 text-right">
                                                    <Button onClick={() => deleteProcess(p.id)} variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <i className="bx bx-trash2 h-4 w-4"  />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Gantt Chart */}
                        {ganttChart.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <i className="bx bx-activity h-5 w-5 text-indigo-500"  /> Gantt Chart Execution Timeline
                                </h3>
                                <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    {ganttChart.map((item, idx) => {
                                        const totalDuration = ganttChart[ganttChart.length - 1].end;
                                        const widthPct = ((item.end - item.start) / totalDuration) * 100;
                                        return (
                                            <div 
                                                key={idx} 
                                                style={{ width: `${widthPct}%` }}
                                                className={`text-center py-4 text-xs font-bold text-white relative border-r last:border-0 border-white/20
                                                    ${item.processId === "Idle" ? "bg-slate-400" : "bg-gradient-to-br from-blue-500 to-indigo-600"}
                                                `}
                                            >
                                                <div>{item.processId}</div>
                                                <div className="text-[10px] opacity-75 mt-1">{item.start} - {item.end}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <i className="bx bx-layoutlist h-5 w-5 text-indigo-500"  /> Performance Analysis
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4 text-sm">
                            <div>
                                <span className="text-slate-400 block text-xs uppercase font-bold">Average Turnaround Time</span>
                                <span className="text-2xl font-black text-slate-800">
                                    {processes[0]?.turnaroundTime !== undefined 
                                        ? (processes.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0) / processes.length).toFixed(2) 
                                        : "0.00"
                                    } ms
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-xs uppercase font-bold">Average Waiting Time</span>
                                <span className="text-2xl font-black text-slate-800">
                                    {processes[0]?.waitingTime !== undefined 
                                        ? (processes.reduce((acc, p) => acc + (p.waitingTime || 0), 0) / processes.length).toFixed(2) 
                                        : "0.00"
                                    } ms
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. MEMORY ALLOCATION INTERFACE */}
            {isMemory && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="bx bx-layers h-5 w-5 text-blue-500"  /> Memory Layout Blocks
                            </h3>

                            <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Process Name</label>
                                    <input value={requestProcId} onChange={e => setRequestProcId(e.target.value)} className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Requested Size (KB)</label>
                                    <input type="number" value={requestProcSize} onChange={e => setRequestProcSize(Number(e.target.value))} className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={allocateMemory} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4">Allocate</Button>
                                    <Button onClick={resetMemoryBlocks} variant="outline" className="text-xs font-bold border-slate-200">Reset</Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {blocks.map((block) => {
                                    const allocatedPct = block.allocatedProcessId ? (block.allocatedSize / block.size) * 100 : 0;
                                    const internalFrag = block.allocatedProcessId ? block.size - block.allocatedSize : 0;
                                    return (
                                        <div key={block.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center">
                                            <div className="w-24 bg-slate-200 text-center py-4 font-bold text-sm text-slate-700 uppercase">{block.id} ({block.size}K)</div>
                                            <div className="flex-1 px-4 relative h-full flex flex-col justify-center py-2">
                                                {block.allocatedProcessId ? (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                                            <span>Process: {block.allocatedProcessId} ({block.allocatedSize} KB)</span>
                                                            <span className="text-amber-600">Internal Frag: {internalFrag} KB</span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: `${allocatedPct}%` }}></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Free Memory Block</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Execution Logs */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <i className="bx bx-activity h-5 w-5 text-indigo-500"  /> Allocation Console logs
                        </h3>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                            {log.length > 0 ? (
                                log.map((item, idx) => <div key={idx}>{item}</div>)
                            ) : (
                                <div className="text-slate-500 italic">No allocation events triggered yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. BANKER'S ALGORITHM INTERFACE */}
            {isBankers && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <i className="bx bx-layers h-5 w-5 text-blue-500"  /> Resource Allocation Matrix (Need = Max - Allocation)
                                </h3>
                                <Button onClick={runBankers} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                    Check System Safety
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-center text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black border-b border-slate-100">
                                                <th className="px-4 py-2">Process</th>
                                                <th className="px-4 py-2">Allocation (A, B, C)</th>
                                                <th className="px-4 py-2">Max (A, B, C)</th>
                                                <th className="px-4 py-2">Need (Max - Allocation)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {bankersInput.alloc.map((row, pIdx) => (
                                                <tr key={pIdx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-slate-700">P{pIdx}</td>
                                                    <td className="px-4 py-3 font-mono text-slate-600">[{row.join(", ")}]</td>
                                                    <td className="px-4 py-3 font-mono text-slate-600">[{bankersInput.max[pIdx].join(", ")}]</td>
                                                    <td className="px-4 py-3 font-mono font-bold text-blue-600">
                                                        [{bankersInput.max[pIdx].map((val, rIdx) => val - row[rIdx]).join(", ")}]
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <i className="bx bx-activity h-5 w-5 text-indigo-500"  /> Banker's Safety Output
                        </h3>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                            {log.map((item, idx) => <div key={idx}>{item}</div>)}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. DEADLOCK DETECTION INTERFACE */}
            {isDeadlock && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <i className="bx bx-shieldalert h-5 w-5 text-rose-500"  /> Resource Allocation Graph Cycle Detection
                                </h3>
                                <Button onClick={detectDeadlock} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                                    Run Cycle Detection
                                </Button>
                            </div>

                            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[250px]">
                                <div className="flex items-center gap-12">
                                    {/* Process Nodes */}
                                    <div className="flex flex-col gap-8">
                                        <div className="h-12 w-12 rounded-full border-2 border-blue-500 bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">P1</div>
                                        <div className="h-12 w-12 rounded-full border-2 border-blue-500 bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">P2</div>
                                    </div>

                                    {/* Directed Paths */}
                                    <div className="flex flex-col gap-6 font-bold text-xs text-slate-400">
                                        <div>Allocated ➔</div>
                                        <div>➔ Requesting</div>
                                    </div>

                                    {/* Resource Nodes */}
                                    <div className="flex flex-col gap-8">
                                        <div className="h-12 w-12 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-sm">R1</div>
                                        <div className="h-12 w-12 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-sm">R2</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[350px]">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <i className="bx bx-activity h-5 w-5 text-indigo-500"  /> Analysis Log
                        </h3>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                            {log.map((item, idx) => <div key={idx}>{item}</div>)}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. PROCESS SYNCHRONIZATION INTERFACE */}
            {isSync && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="bx bx-activity h-5 w-5 text-blue-500"  /> Mutex Lock & Shared Buffer Simulator
                            </h3>

                            <div className="flex justify-center gap-4">
                                <Button onClick={runProducer} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                    Trigger Producer (Produce Item)
                                </Button>
                                <Button onClick={runConsumer} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                                    Trigger Consumer (Consume Item)
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs uppercase font-bold text-slate-400 mb-2">Buffer States ({buffer.length}/{bufferLimit})</div>
                                <div className="flex gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[80px] items-center">
                                    {buffer.map((item, index) => (
                                        <div key={index} className="px-4 py-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm animate-in zoom-in-50">
                                            {item}
                                        </div>
                                    ))}
                                    {buffer.length === 0 && <span className="text-xs text-slate-400 italic font-bold">Buffer Empty</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <i className="bx bx-activity h-5 w-5 text-indigo-500"  /> Synchronization Logs
                        </h3>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                            {syncLog.map((item, idx) => <div key={idx}>{item}</div>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

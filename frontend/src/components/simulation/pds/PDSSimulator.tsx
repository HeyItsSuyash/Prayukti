"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
    Play, Pause, RefreshCw, Plus, Trash2, ArrowRight, ArrowLeftRight, GitFork, 
    Network, ArrowDown, Database, Code
} from "lucide-react";

export default function PDSSimulator({ labId }: { labId: string }) {
    const isStack = labId.includes("exp-1");
    const isQueue = labId.includes("exp-2") || labId.includes("exp-3");
    const isLinkedList = labId.includes("exp-4") || labId.includes("exp-5");
    const isTree = labId.includes("exp-6") || labId.includes("exp-7");
    const isGraph = labId.includes("exp-8") || labId.includes("exp-9") || labId.includes("exp-10");

    // Console logs
    const [logs, setLogs] = useState<string[]>([]);
    
    // Stack State
    const [stack, setStack] = useState<number[]>([10, 20, 30]);
    const [inputValue, setInputValue] = useState("");

    // Queue State
    const [queue, setQueue] = useState<number[]>([15, 25, 35]);
    const [front, setFront] = useState(0);
    const [rear, setRear] = useState(2);
    const queueLimit = 6;

    // Linked List State
    const [list, setList] = useState<{ value: number; id: number }[]>([
        { value: 12, id: 1 },
        { value: 99, id: 2 },
        { value: 37, id: 3 }
    ]);
    const [listInput, setListInput] = useState("");

    // Tree State
    const [treeNodes, setTreeNodes] = useState<{ val: number; balance?: number }[]>([
        { val: 50, balance: 0 },
        { val: 30, balance: 0 },
        { val: 70, balance: 0 },
        { val: 20, balance: 0 },
        { val: 40, balance: 0 }
    ]);
    const [treeInput, setTreeInput] = useState("");

    // Graph Traversals
    const [graphVisited, setGraphVisited] = useState<string[]>([]);
    const [graphActiveQueue, setGraphActiveQueue] = useState<string[]>([]);

    // 1. Stack Operations
    const pushStack = () => {
        const val = Number(inputValue);
        if (isNaN(val) || inputValue.trim() === "") return;
        if (stack.length >= 8) {
            setLogs(prev => ["Stack Overflow! Maximum size reached.", ...prev]);
            return;
        }
        setStack([...stack, val]);
        setLogs(prev => [`Pushed ${val} onto Stack. Top is now at index ${stack.length}`, ...prev]);
        setInputValue("");
    };

    const popStack = () => {
        if (stack.length === 0) {
            setLogs(prev => ["Stack Underflow! Stack is empty.", ...prev]);
            return;
        }
        const val = stack[stack.length - 1];
        setStack(stack.slice(0, -1));
        setLogs(prev => [`Popped ${val} from Stack. Top is now at index ${stack.length - 2}`, ...prev]);
    };

    // 2. Queue Operations
    const enqueue = () => {
        const val = Number(inputValue);
        if (isNaN(val) || inputValue.trim() === "") return;
        if (queue.length >= queueLimit) {
            setLogs(prev => ["Queue Full!", ...prev]);
            return;
        }
        setQueue([...queue, val]);
        setRear(prev => prev + 1);
        setLogs(prev => [`Enqueued ${val} at rear. Rear index: ${queue.length}`, ...prev]);
        setInputValue("");
    };

    const dequeue = () => {
        if (queue.length === 0) {
            setLogs(prev => ["Queue Underflow! Queue is empty.", ...prev]);
            return;
        }
        const val = queue[0];
        setQueue(queue.slice(1));
        setFront(prev => prev + 1);
        setLogs(prev => [`Dequeued ${val} from front. Front shifts forward.`, ...prev]);
    };

    // 3. Linked List Operations
    const insertNode = (pos: "head" | "tail") => {
        const val = Number(listInput);
        if (isNaN(val) || listInput.trim() === "") return;
        const newNode = { value: val, id: Date.now() };
        if (pos === "head") {
            setList([newNode, ...list]);
            setLogs(prev => [`Inserted ${val} at head. Pointers updated.`, ...prev]);
        } else {
            setList([...list, newNode]);
            setLogs(prev => [`Inserted ${val} at tail. Previous node now points to new node.`, ...prev]);
        }
        setListInput("");
    };

    const deleteNode = (id: number, val: number) => {
        setList(list.filter(item => item.id !== id));
        setLogs(prev => [`Deleted node ${val}. Next/prev pointers re-routed.`, ...prev]);
    };

    // 4. Tree Operations
    const insertTree = () => {
        const val = Number(treeInput);
        if (isNaN(val) || treeInput.trim() === "") return;
        
        let path = [50]; // Assume root is 50 for search visualization
        if (val < 50) path.push(30);
        if (val < 30) path.push(20);
        
        setTreeNodes([...treeNodes, { val }]);
        setLogs(prev => [
            `BST Insert: ${val}. BST traversal path: ${path.join(" -> ")} -> Inserted`,
            labId.includes("exp-7") ? `AVL Rotation Check: Node balance factors updated.` : "",
            ...prev
        ].filter(Boolean));
        setTreeInput("");
    };

    // 5. Graph Traversals
    const runTraversal = (type: "BFS" | "DFS") => {
        setGraphVisited([]);
        setGraphActiveQueue([]);
        
        if (type === "BFS") {
            setLogs(prev => [
                "BFS Traversal: Queue setup [A]. Visited A.",
                "Visit Neighbors: B, C. Queue updated to [B, C]",
                "Dequeued B. Visit neighbor D. Queue [C, D]. Visited [A, B, C, D]",
                ...prev
            ]);
            setGraphVisited(["A", "B", "C", "D"]);
            setGraphActiveQueue(["C", "D"]);
        } else {
            setLogs(prev => [
                "DFS Traversal: Recursively visiting nodes deeply.",
                "Visited A -> B -> D. Backtracking to A.",
                "Visited C.",
                "Final DFS Sequence: A, B, D, C",
                ...prev
            ]);
            setGraphVisited(["A", "B", "D", "C"]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fafbfe] p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Principles of Data Structures</h2>
                    <p className="text-sm text-slate-500 mt-1">Interactive Structure & Algorithm Simulator</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Lab Slot: {labId}</span>
                </div>
            </div>

            {/* STACK / QUEUE SIMULATIONS */}
            {(isStack || isQueue) && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Database className="h-5 w-5 text-indigo-500" /> 
                                {isStack ? "LIFO Stack Visualizer" : "FIFO Queue Visualizer"}
                            </h3>

                            {/* Actions panel */}
                            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Input Value</label>
                                    <input 
                                        type="number" 
                                        value={inputValue} 
                                        onChange={e => setInputValue(e.target.value)} 
                                        placeholder="e.g. 45" 
                                        className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" 
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {isStack ? (
                                        <>
                                            <Button onClick={pushStack} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Push Node</Button>
                                            <Button onClick={popStack} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">Pop Node</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={enqueue} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Enqueue</Button>
                                            <Button onClick={dequeue} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">Dequeue</Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Visualization boxes */}
                            {isStack ? (
                                <div className="flex flex-col-reverse items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl min-h-[300px]">
                                    <div className="border-2 border-slate-400 border-t-0 w-36 flex flex-col justify-end p-2 gap-2 rounded-b-xl min-h-[220px]">
                                        {stack.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`py-3 text-center text-white font-bold rounded-lg shadow-sm text-sm relative animate-in slide-in-from-top-12 duration-300
                                                    ${idx === stack.length - 1 ? "bg-gradient-to-br from-indigo-500 to-indigo-600 ring-4 ring-indigo-200" : "bg-slate-700"}
                                                `}
                                            >
                                                {item}
                                                {idx === stack.length - 1 && (
                                                    <span className="absolute -left-16 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                        Top ➔
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {stack.length === 0 && (
                                            <div className="text-center text-xs text-slate-400 font-bold italic py-8">Stack Empty</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl min-h-[200px]">
                                    <div className="flex gap-2 items-center w-full max-w-md">
                                        {Array.from({ length: queueLimit }).map((_, idx) => {
                                            const item = queue[idx];
                                            const isFrontNode = idx === 0 && queue.length > 0;
                                            const isRearNode = idx === queue.length - 1 && queue.length > 0;
                                            return (
                                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                                    <div className={`w-full py-4 text-center text-sm font-bold border rounded-lg shadow-sm relative
                                                        ${item !== undefined ? "bg-slate-700 text-white border-slate-600" : "bg-white text-slate-300 border-dashed border-slate-200"}
                                                    `}>
                                                        {item !== undefined ? item : ""}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-400 text-center h-4">
                                                        {isFrontNode && "Front ⬆"}
                                                        {isRearNode && "Rear ⬆"}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Console Logs */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[450px]">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Code className="h-5 w-5 text-indigo-500" /> Structure Output Logs
                        </h3>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                            {logs.map((log, index) => <div key={index}>{log}</div>)}
                        </div>
                    </div>
                </div>
            )}

            {/* LINKED LIST SIMULATIONS */}
            {isLinkedList && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Database className="h-5 w-5 text-indigo-500" /> 
                                {labId.includes("exp-4") ? "Singly Linked List chain" : "Doubly Linked List node links"}
                            </h3>

                            {/* Node Operations */}
                            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Node Value</label>
                                    <input 
                                        type="number" 
                                        value={listInput} 
                                        onChange={e => setListInput(e.target.value)} 
                                        placeholder="e.g. 50" 
                                        className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" 
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => insertNode("head")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Insert Head</Button>
                                    <Button onClick={() => insertNode("tail")} className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs">Insert Tail</Button>
                                </div>
                            </div>

                            {/* Chains of Nodes */}
                            <div className="flex flex-wrap items-center gap-4 p-8 bg-slate-50 border border-slate-200 rounded-2xl min-h-[180px] overflow-x-auto">
                                {list.map((item, idx) => (
                                    <React.Fragment key={item.id}>
                                        <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden flex shadow-sm animate-in zoom-in-70">
                                            {/* Value Box */}
                                            <div className="px-4 py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center min-w-[50px]">{item.value}</div>
                                            {/* Actions / Address */}
                                            <div className="px-3 py-2 flex flex-col justify-center gap-1 bg-slate-50 border-l">
                                                <div className="text-[8px] text-slate-400 font-mono font-bold">ADDR: 0x{item.id.toString(16).slice(-4).toUpperCase()}</div>
                                                <Button onClick={() => deleteNode(item.id, item.value)} variant="ghost" className="h-5 w-5 p-0 text-red-500 hover:bg-red-50 rounded">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        {idx < list.length - 1 && (
                                            labId.includes("exp-4") ? (
                                                <ArrowRight className="text-slate-400 shrink-0" />
                                            ) : (
                                                <ArrowLeftRight className="text-slate-400 shrink-0" />
                                            )
                                        )}
                                    </React.Fragment>
                                ))}

                                {list.length > 0 && (
                                    <>
                                        <ArrowRight className="text-slate-400 shrink-0" />
                                        <div className="px-3 py-2 border-2 border-dashed border-slate-300 text-slate-400 font-black text-xs rounded-xl bg-white shadow-sm shrink-0">NULL</div>
                                    </>
                                )}

                                {list.length === 0 && (
                                    <span className="text-sm text-slate-400 italic font-bold w-full text-center">List is empty</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Code className="h-5 w-5 text-indigo-500" /> Traversal Output Logs
                        </h3>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                            {logs.map((log, index) => <div key={index}>{log}</div>)}
                        </div>
                    </div>
                </div>
            )}

            {/* BST / AVL TREE SIMULATIONS */}
            {isTree && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <GitFork className="h-5 w-5 text-indigo-500" /> 
                                {labId.includes("exp-6") ? "Binary Search Tree (BST) Nodes" : "Self-Balancing AVL tree nodes"}
                            </h3>

                            {/* Node Operations */}
                            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Insert Node Value</label>
                                    <input 
                                        type="number" 
                                        value={treeInput} 
                                        onChange={e => setTreeInput(e.target.value)} 
                                        placeholder="e.g. 25" 
                                        className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2" 
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={insertTree} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Insert Node</Button>
                                </div>
                            </div>

                            {/* Simple Visual Node Tree Representation */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
                                <div className="flex flex-col items-center gap-8 w-full">
                                    {/* Level 0 Root */}
                                    <div className="h-10 w-10 bg-slate-800 text-white font-black text-xs rounded-full flex items-center justify-center shadow-md relative">
                                        50
                                        {labId.includes("exp-7") && <span className="absolute -top-6 text-[8px] bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-black border">BF: 0</span>}
                                    </div>
                                    
                                    {/* Level 1 Children */}
                                    <div className="flex justify-around w-full max-w-sm relative">
                                        <div className="h-10 w-10 bg-slate-700 text-white font-black text-xs rounded-full flex items-center justify-center shadow-md relative">
                                            30
                                            {labId.includes("exp-7") && <span className="absolute -top-6 text-[8px] bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-black border">BF: 0</span>}
                                        </div>
                                        <div className="h-10 w-10 bg-slate-700 text-white font-black text-xs rounded-full flex items-center justify-center shadow-md relative">
                                            70
                                            {labId.includes("exp-7") && <span className="absolute -top-6 text-[8px] bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-black border">BF: 0</span>}
                                        </div>
                                    </div>

                                    {/* Level 2 Children */}
                                    <div className="flex justify-around w-full max-w-md">
                                        <div className="flex justify-around w-[50%]">
                                            <div className="h-9 w-9 bg-slate-600 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow relative">
                                                20
                                            </div>
                                            <div className="h-9 w-9 bg-slate-600 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow relative">
                                                40
                                            </div>
                                        </div>
                                        <div className="w-[50%] flex justify-center">
                                            <span className="text-[10px] text-slate-400 font-bold italic">Empty Subtrees</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Code className="h-5 w-5 text-indigo-500" /> BST Insertion Trace
                        </h3>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                            {logs.map((log, index) => <div key={index}>{log}</div>)}
                        </div>
                    </div>
                </div>
            )}

            {/* GRAPH BFS/DFS SIMULATIONS */}
            {isGraph && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Network className="h-5 w-5 text-indigo-500" /> Graph Adjacency & Traversals (BFS / DFS / Shortest Path)
                                </h3>
                                <div className="flex gap-2">
                                    <Button onClick={() => runTraversal("BFS")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Run BFS</Button>
                                    <Button onClick={() => runTraversal("DFS")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">Run DFS</Button>
                                </div>
                            </div>

                            {/* Node Graph Grid layout */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px]">
                                <div className="grid grid-cols-3 gap-16 relative">
                                    <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300
                                        ${graphVisited.includes("A") ? "bg-emerald-500 text-white border-emerald-400" : "bg-white text-slate-700 border-slate-200"}
                                    `}>A</div>
                                    <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300
                                        ${graphVisited.includes("B") ? "bg-emerald-500 text-white border-emerald-400" : "bg-white text-slate-700 border-slate-200"}
                                    `}>B</div>
                                    <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300
                                        ${graphVisited.includes("C") ? "bg-emerald-500 text-white border-emerald-400" : "bg-white text-slate-700 border-slate-200"}
                                    `}>C</div>
                                    <div className="col-span-3 flex justify-center">
                                        <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300
                                            ${graphVisited.includes("D") ? "bg-emerald-500 text-white border-emerald-400" : "bg-white text-slate-700 border-slate-200"}
                                        `}>D</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[350px]">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Code className="h-5 w-5 text-indigo-500" /> Traversal Sequence Log
                        </h3>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                            {logs.map((log, index) => <div key={index}>{log}</div>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

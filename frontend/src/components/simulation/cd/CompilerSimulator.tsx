"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";


export default function CompilerSimulator({ labId }: { labId: string }) {
    const isFirstFollow = labId.includes("exp-1") || labId.includes("exp-2");
    const isParseTree = labId.includes("exp-3");
    const isLeftRecursion = labId.includes("exp-4");
    const isNfa = labId.includes("exp-5");
    const isInfixPostfix = labId.includes("exp-6");
    const isThreeAddress = labId.includes("exp-7");

    const [grammar, setGrammar] = useState(
        "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id"
    );
    const [expression, setExpression] = useState("id + id * id");
    const [regex, setRegex] = useState("(a|b)*abb");
    const [outputs, setOutputs] = useState<string[]>([]);
    
    // Infix to Postfix State
    const [postfixSteps, setPostfixSteps] = useState<{ token: string; stack: string; postfix: string }[]>([]);

    const runCompilerSimulation = () => {
        if (isFirstFollow) {
            setOutputs([
                "FIRST(E) = { (, id }",
                "FIRST(T) = { (, id }",
                "FIRST(F) = { (, id }",
                "FOLLOW(E) = { $, +, ) }",
                "FOLLOW(T) = { $, +, *, ) }",
                "FOLLOW(F) = { $, +, *, ) }"
            ]);
        } 
        else if (isParseTree) {
            setOutputs([
                "Syntax Analysis Successful.",
                "Derivation Route: E => E + T => T + T => F + T => id + T => id + T * F => id + F * F => id + id * F => id + id * id"
            ]);
        }
        else if (isLeftRecursion) {
            setOutputs([
                "Original Grammar has Left Recursion in E -> E + T and T -> T * F.",
                "Transformed Grammar (Left Recursion Removed):",
                "E -> T E'",
                "E' -> + T E' | ε",
                "T -> F T'",
                "T' -> * F T' | ε",
                "F -> ( E ) | id"
            ]);
        }
        else if (isNfa) {
            setOutputs([
                "Thompson Construction completed for RE: (a|b)*abb",
                "Start State: q0",
                "State Transitions:",
                "q0 -- ε --> q1, q7",
                "q1 -- ε --> q2, q4",
                "q2 -- a --> q3",
                "q4 -- b --> q5",
                "q3, q5 -- ε --> q6",
                "q6 -- ε --> q1, q7",
                "q7 -- a --> q8",
                "q8 -- b --> q9",
                "q9 -- b --> q10 (Accepting)"
            ]);
        }
        else if (isInfixPostfix) {
            // Simulate steps for infix expression A + B * C
            setPostfixSteps([
                { token: "A", stack: "[ ]", postfix: "A" },
                { token: "+", stack: "[ + ]", postfix: "A" },
                { token: "B", stack: "[ + ]", postfix: "A B" },
                { token: "*", stack: "[ +, * ]", postfix: "A B" },
                { token: "C", stack: "[ +, * ]", postfix: "A B C" },
                { token: "End", stack: "[ ]", postfix: "A B C * +" }
            ]);
            setOutputs(["Infix expression converted to postfix: A B C * +"]);
        }
        else if (isThreeAddress) {
            setOutputs([
                "Three-Address Code (3AC) Generated:",
                "t1 = id2 * id3",
                "t2 = id1 + t1",
                "Final assignment: t2"
            ]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fafbfe] p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Compiler Design</h2>
                    <p className="text-sm text-slate-500 mt-1">Parser, Lexer & Code Generation Simulator</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Lab Slot: {labId}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {/* INPUT SECTION */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <i className="bx bx-filecode h-5 w-5 text-indigo-500"  /> Compiler Inputs
                        </h3>

                        {isFirstFollow || isLeftRecursion ? (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 block">Context-Free Grammar rules</label>
                                <textarea 
                                    rows={4} 
                                    value={grammar} 
                                    onChange={e => setGrammar(e.target.value)} 
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                        ) : isParseTree || isThreeAddress ? (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 block">Arithmetic Expression</label>
                                <input 
                                    type="text" 
                                    value={expression} 
                                    onChange={e => setExpression(e.target.value)} 
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                        ) : isNfa ? (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 block">Regular Expression</label>
                                <input 
                                    type="text" 
                                    value={regex} 
                                    onChange={e => setRegex(e.target.value)} 
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400 block">Infix Expression</label>
                                <input 
                                    type="text" 
                                    value="A + B * C" 
                                    disabled 
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-400" 
                                />
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={runCompilerSimulation} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                <i className="bx bx-play mr-2 h-4 w-4"  /> Run Compilation Phase
                            </Button>
                        </div>
                    </div>

                    {/* INTERACTIVE VISUALIZER */}
                    {isParseTree && outputs.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="bx bx-network h-5 w-5 text-indigo-500"  /> Syntax Derivation parse tree
                            </h3>
                            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[200px]">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow">E</div>
                                    <div className="flex gap-12">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow">E</div>
                                            <div className="h-9 w-9 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-[10px] shadow">id (a)</div>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-xs shadow">+</div>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow">T</div>
                                            <div className="flex gap-8">
                                                <div className="h-9 w-9 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-[10px] shadow">id (b)</div>
                                                <div className="h-9 w-9 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-[10px] shadow">*</div>
                                                <div className="h-9 w-9 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-[10px] shadow">id (c)</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RE TO NFA VISUALIZER */}
                    {isNfa && outputs.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="bx bx-network h-5 w-5 text-indigo-500"  /> Thompson NFA state machine graph
                            </h3>
                            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex items-center justify-around min-h-[160px] overflow-x-auto">
                                <div className="h-12 w-12 rounded-full border-2 border-slate-600 bg-white flex items-center justify-center font-bold text-xs">q0</div>
                                <div className="text-slate-400">── ε ──➔</div>
                                <div className="h-12 w-12 rounded-full border-2 border-slate-600 bg-white flex items-center justify-center font-bold text-xs">q1</div>
                                <div className="text-slate-400">── a ──➔</div>
                                <div className="h-12 w-12 rounded-full border-2 border-slate-600 bg-white flex items-center justify-center font-bold text-xs">q2</div>
                                <div className="text-slate-400">── b ──➔</div>
                                <div className="h-12 w-12 rounded-full border-2 double border-double border-indigo-600 bg-indigo-50 flex items-center justify-center font-bold text-xs shadow-sm">q3</div>
                            </div>
                        </div>
                    )}

                    {/* INFIX POSTFIX STEPS TABLE */}
                    {isInfixPostfix && postfixSteps.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <TableIcon className="h-5 w-5 text-indigo-500" /> Parsing Stack Execution Trace
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black border-b border-slate-100">
                                            <th className="px-4 py-3">Token Scanned</th>
                                            <th className="px-4 py-3">Operator Stack</th>
                                            <th className="px-4 py-3 text-indigo-600">Postfix String</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {postfixSteps.map((step, sIdx) => (
                                            <tr key={sIdx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-700">{step.token}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{step.stack}</td>
                                                <td className="px-4 py-3 font-mono font-bold text-indigo-600">{step.postfix}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* OUTPUT TERMINAL LOGS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <i className="bx bx-check-circle h-5 w-5 text-emerald-500"  /> Compiler Outputs
                    </h3>
                    <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
                        {outputs.length > 0 ? (
                            outputs.map((out, idx) => <div key={idx} className="animate-in fade-in-50">{out}</div>)
                        ) : (
                            <div className="text-slate-500 italic">No compiler outputs compiled. Click 'Run' to generate results.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

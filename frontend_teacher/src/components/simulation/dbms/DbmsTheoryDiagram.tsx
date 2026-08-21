"use client";

import React, { useState } from 'react';

export default function DbmsTheoryDiagram() {
    const [activeTab, setActiveTab] = useState<'acid' | 'architecture' | 'sql'>('acid');

    // ACID Atomicity simulation state
    const [accountA, setAccountA] = useState(1000);
    const [accountB, setAccountB] = useState(500);
    const [step, setStep] = useState<number>(0);
    const [status, setStatus] = useState<string>("IDLE");
    const [log, setLog] = useState<string[]>([]);

    // Consistency simulation state
    const [overdrawAmount, setOverdrawAmount] = useState(1500);
    const [consistencyMsg, setConsistencyMsg] = useState<string>("");

    // Selected architecture node
    const [selectedNode, setSelectedNode] = useState<string>("db");

    // SQL category
    const [selectedSqlCat, setSelectedSqlCat] = useState<'ddl' | 'dml' | 'dql' | 'dcl' | 'tcl'>('dml');

    const resetAcidSim = () => {
        setAccountA(1000);
        setAccountB(500);
        setStep(0);
        setStatus("IDLE");
        setLog([]);
    };

    const runSuccessfulTransaction = async () => {
        resetAcidSim();
        setStatus("PROCESSING");
        setLog(["[T1] BEGIN TRANSACTION"]);
        
        await new Promise(r => setTimeout(r, 600));
        setAccountA(800);
        setStep(1);
        setLog(prev => [...prev, "[T1] Step 1: Deducted $200 from Account A (New Balance: $800)"]);
        
        await new Promise(r => setTimeout(r, 800));
        setAccountB(700);
        setStep(2);
        setLog(prev => [...prev, "[T1] Step 2: Added $200 to Account B (New Balance: $700)"]);
        
        await new Promise(r => setTimeout(r, 600));
        setStatus("COMMITTED");
        setLog(prev => [...prev, "[T1] COMMIT TRANSACTION - All changes saved permanently!"]);
    };

    const runFailedTransaction = async () => {
        resetAcidSim();
        setStatus("PROCESSING");
        setLog(["[T1] BEGIN TRANSACTION"]);
        
        await new Promise(r => setTimeout(r, 600));
        setAccountA(800);
        setStep(1);
        setLog(prev => [...prev, "[T1] Step 1: Deducted $200 from Account A (New Balance: $800)"]);
        
        await new Promise(r => setTimeout(r, 800));
        setStep(1.5);
        setLog(prev => [...prev, "[CRASH] System/Network Failure before Step 2!"]);
        
        await new Promise(r => setTimeout(r, 1000));
        setAccountA(1000);
        setStep(0);
        setStatus("ROLLED_BACK");
        setLog(prev => [...prev, "[T1] ROLLBACK TRIGGERED - Restored Account A to $1000 (Atomicity Preserved)"]);
    };

    const testConsistencyRule = () => {
        if (overdrawAmount > accountA) {
            setConsistencyMsg(`REJECTED: Transfer of $${overdrawAmount} exceeds Account A balance ($${accountA}). Constraint 'Balance >= 0' maintained!`);
        } else {
            setConsistencyMsg(`ACCEPTED: Transfer of $${overdrawAmount} is valid.`);
        }
    };

    return (
        <div className="w-full my-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden font-sans">
            {/* Top Header */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <i className="bx bx-diagram text-2xl"></i>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Interactive DBMS Concepts & ACID Visualizer</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Click and test database concepts, architecture tiers, and ACID transaction guarantees.</p>
                    </div>
                </div>

                {/* Tab Controls */}
                <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl gap-1">
                    <button
                        onClick={() => setActiveTab('acid')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'acid'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        1. ACID Properties Simulator
                    </button>
                    <button
                        onClick={() => setActiveTab('architecture')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'architecture'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        2. 3-Tier Architecture
                    </button>
                    <button
                        onClick={() => setActiveTab('sql')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'sql'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        3. SQL Categories
                    </button>
                </div>
            </div>

            {/* TAB 1: ACID PROPERTIES SIMULATOR */}
            {activeTab === 'acid' && (
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ATOMICITY DEMO */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs flex items-center justify-center font-black">A</span>
                                    Atomicity ("All or Nothing")
                                </h5>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                    status === 'COMMITTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                                    status === 'ROLLED_BACK' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                                    status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 animate-pulse' :
                                    'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                }`}>
                                    {status}
                                </span>
                            </div>

                            {/* Bank Accounts State */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border transition-all text-center ${
                                    step >= 1 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                                }`}>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Account A (Sender)</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">${accountA}</p>
                                </div>
                                <div className={`p-4 rounded-xl border transition-all text-center ${
                                    step === 2 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                                }`}>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Account B (Receiver)</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">${accountB}</p>
                                </div>
                            </div>

                            {/* Interactive Buttons */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                <button
                                    onClick={runSuccessfulTransaction}
                                    disabled={status === 'PROCESSING'}
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    Run Normal Transfer ($200)
                                </button>
                                <button
                                    onClick={runFailedTransaction}
                                    disabled={status === 'PROCESSING'}
                                    className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    Simulate Mid-way Crash
                                </button>
                            </div>

                            {/* Execution Log */}
                            <div className="bg-slate-900 text-slate-300 p-3 rounded-xl text-[11px] font-mono h-28 overflow-y-auto space-y-1">
                                {log.length === 0 ? (
                                    <p className="text-slate-500 italic">Click a button above to test transaction execution...</p>
                                ) : (
                                    log.map((line, idx) => (
                                        <div key={idx} className={line.includes("ROLLBACK") ? "text-rose-400 font-bold" : line.includes("COMMIT") ? "text-emerald-400 font-bold" : ""}>
                                            {line}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* CONSISTENCY DEMO */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs flex items-center justify-center font-black">C</span>
                                Consistency (Database Invariants)
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Ensures that a transaction can only bring the database from one valid state to another, preserving set rules like minimum balance constraints.
                            </p>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-600 dark:text-slate-400">Current Balance:</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-bold">${accountA}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-600 dark:text-slate-400">Attempted Withdrawal:</span>
                                    <span className="text-rose-600 font-bold">${overdrawAmount}</span>
                                </div>

                                <button
                                    onClick={testConsistencyRule}
                                    className="w-full py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all"
                                >
                                    Test Constraint Enforcement
                                </button>

                                {consistencyMsg && (
                                    <div className={`p-3 rounded-lg text-xs font-medium ${
                                        consistencyMsg.startsWith('REJECTED')
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                                    }`}>
                                        {consistencyMsg}
                                    </div>
                                )}
                            </div>

                            {/* ISOLATION & DURABILITY QUICK CARDS */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Isolation (I)</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                        Concurrent transactions execute as if sequential without interfering.
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Durability (D)</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                        Committed data survives system crashes via non-volatile storage logging.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: 3-TIER ARCHITECTURE */}
            {activeTab === 'architecture' && (
                <div className="p-6 space-y-6">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        Select any tier below to view its components, responsibilities, and communication protocols.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Tier 1 */}
                        <div
                            onClick={() => setSelectedNode('client')}
                            className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                selectedNode === 'client'
                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3">
                                <i className="bx bx-laptop text-2xl"></i>
                            </div>
                            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tier 1: Presentation Layer</h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">User Interface (Browser, Web/Mobile Apps)</p>
                        </div>

                        {/* Tier 2 */}
                        <div
                            onClick={() => setSelectedNode('app')}
                            className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                selectedNode === 'app'
                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-3">
                                <i className="bx bx-server text-2xl"></i>
                            </div>
                            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tier 2: Application Layer</h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Business Logic & Database Drivers (JDBC/ODBC)</p>
                        </div>

                        {/* Tier 3 */}
                        <div
                            onClick={() => setSelectedNode('db')}
                            className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                selectedNode === 'db'
                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3">
                                <i className="bx bx-data text-2xl"></i>
                            </div>
                            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tier 3: Database Engine Layer</h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Query Processor, Transaction Manager, Physical Storage</p>
                        </div>
                    </div>

                    {/* Node Details Panel */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {selectedNode === 'client' && (
                            <div className="space-y-2">
                                <h6 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Presentation Tier Details</h6>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    The end-user facing client tier. Users interact with forms and dashboards without directly knowing the database structure. It communicates with the application server using HTTPS / REST APIs.
                                </p>
                            </div>
                        )}
                        {selectedNode === 'app' && (
                            <div className="space-y-2">
                                <h6 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Application Tier Details</h6>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Contains backend web application logic (Express, Axum, Spring Boot) and database connectors (JDBC, PyODBC, SQLx). It validates inputs, executes business rules, and sends parameterized SQL statements to the database tier.
                                </p>
                            </div>
                        )}
                        {selectedNode === 'db' && (
                            <div className="space-y-2">
                                <h6 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Database Tier Details</h6>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Houses the relational database engine (PostgreSQL, MySQL, Oracle). It contains the Query Optimizer, Buffer Pool Manager, Lock Manager (Concurrency Control), and Write-Ahead Log (WAL) to guarantee ACID properties and high-throughput query execution.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: SQL CATEGORIES */}
            {activeTab === 'sql' && (
                <div className="p-6 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {(['ddl', 'dml', 'dql', 'dcl', 'tcl'] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedSqlCat(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                    selectedSqlCat === cat
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs space-y-3">
                        {selectedSqlCat === 'ddl' && (
                            <div>
                                <p className="text-emerald-400 font-bold">// Data Definition Language (Structure)</p>
                                <pre className="mt-2 text-slate-300 overflow-x-auto">
{`CREATE TABLE Students (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    enrollment_date DATE DEFAULT CURRENT_DATE
);`}
                                </pre>
                            </div>
                        )}
                        {selectedSqlCat === 'dml' && (
                            <div>
                                <p className="text-emerald-400 font-bold">// Data Manipulation Language (Records)</p>
                                <pre className="mt-2 text-slate-300 overflow-x-auto">
{`INSERT INTO Students (id, name, email) 
VALUES (1, 'Aditya Sharma', 'aditya@mmmut.ac.in');

UPDATE Students 
SET email = 'aditya.new@mmmut.ac.in' 
WHERE id = 1;`}
                                </pre>
                            </div>
                        )}
                        {selectedSqlCat === 'dql' && (
                            <div>
                                <p className="text-emerald-400 font-bold">// Data Query Language (Retrieval)</p>
                                <pre className="mt-2 text-slate-300 overflow-x-auto">
{`SELECT s.id, s.name, COUNT(a.id) as total_attendance
FROM Students s
JOIN attendance_logs a ON s.id = a.student_id
WHERE s.enrollment_date >= '2026-01-01'
GROUP BY s.id, s.name
ORDER BY total_attendance DESC;`}
                                </pre>
                            </div>
                        )}
                        {selectedSqlCat === 'dcl' && (
                            <div>
                                <p className="text-emerald-400 font-bold">// Data Control Language (Permissions)</p>
                                <pre className="mt-2 text-slate-300 overflow-x-auto">
{`GRANT SELECT, INSERT ON Students TO lab_assistant;
REVOKE DELETE ON Students FROM lab_assistant;`}
                                </pre>
                            </div>
                        )}
                        {selectedSqlCat === 'tcl' && (
                            <div>
                                <p className="text-emerald-400 font-bold">// Transaction Control Language (State Control)</p>
                                <pre className="mt-2 text-slate-300 overflow-x-auto">
{`BEGIN TRANSACTION;
UPDATE Accounts SET balance = balance - 200 WHERE account_id = 'A';
UPDATE Accounts SET balance = balance + 200 WHERE account_id = 'B';
COMMIT; -- Or ROLLBACK; if any error occurs`}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

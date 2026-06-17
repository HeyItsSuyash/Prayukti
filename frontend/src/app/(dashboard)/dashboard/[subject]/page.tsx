"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Loader2, BookOpen, PlayCircle, ClipboardList, Clock, BarChart } from "lucide-react";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";

interface Experiment {
    id: number | string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    href: string;
    description?: string;
    duration?: string;
}

// Complete offline fallback — every subject/lab that exists in the system
const SUBJECT_EXPERIMENTS: Record<string, Experiment[]> = {
    cn: [
        { id: "cn-exp-1", title: "OSI vs TCP/IP Reference Models", difficulty: "Easy", href: "/dashboard/cn/cn-exp-1", description: "Study and compare the OSI and TCP/IP reference models through interactive simulation.", duration: "45 mins" },
        { id: "cn-exp-2", title: "CSMA/CD Protocol Simulation", difficulty: "Medium", href: "/dashboard/cn/cn-exp-2", description: "Simulate CSMA/CD protocol and understand collision detection in Ethernet networks.", duration: "50 mins" },
        { id: "cn-exp-3", title: "ARP Protocol Simulation", difficulty: "Medium", href: "/dashboard/cn/cn-exp-3", description: "Understand Address Resolution Protocol through interactive packet-level simulation.", duration: "40 mins" },
        { id: "cn-exp-4", title: "Distance Vector Routing", difficulty: "Hard", href: "/dashboard/cn/cn-exp-4", description: "Explore how routers exchange routing information using the Bellman-Ford algorithm.", duration: "60 mins" },
        { id: "cn-exp-5", title: "Selective Repeat ARQ", difficulty: "Hard", href: "/dashboard/cn/cn-exp-5", description: "Simulate Selective Repeat sliding window protocol for error control.", duration: "55 mins" },
        { id: "cn-exp-6", title: "Sliding Window Simulation", difficulty: "Medium", href: "/dashboard/cn/cn-exp-6", description: "Visualize flow control using sliding window protocols.", duration: "45 mins" },
        { id: "cn-exp-7", title: "Token Ring / FDDI Protocol", difficulty: "Medium", href: "/dashboard/cn/cn-exp-7", description: "Simulate Token Ring, Token Bus, and FDDI token-passing protocols.", duration: "50 mins" },
    ],
    os: [
        { id: "os-exp-1", title: "CPU Scheduling Algorithms", difficulty: "Medium", href: "/dashboard/os/os-exp-1", description: "Simulate FCFS, SJF, Round Robin and Priority scheduling algorithms.", duration: "60 mins" },
        { id: "os-exp-2", title: "Deadlock Detection & Avoidance", difficulty: "Hard", href: "/dashboard/os/os-exp-2", description: "Implement Banker's Algorithm for deadlock avoidance.", duration: "55 mins" },
        { id: "os-exp-3", title: "Page Replacement Algorithms", difficulty: "Medium", href: "/dashboard/os/os-exp-3", description: "Compare FIFO, LRU, and Optimal page replacement policies.", duration: "50 mins" },
        { id: "os-exp-4", title: "Process Synchronization", difficulty: "Hard", href: "/dashboard/os/os-exp-4", description: "Solve critical section problems using semaphores and monitors.", duration: "60 mins" },
        { id: "os-exp-5", title: "Memory Management", difficulty: "Medium", href: "/dashboard/os/os-exp-5", description: "Implement paging, segmentation, and virtual memory concepts.", duration: "55 mins" },
        { id: "os-exp-6", title: "File System Management", difficulty: "Medium", href: "/dashboard/os/os-exp-6", description: "Explore file allocation methods: contiguous, linked, indexed.", duration: "50 mins" },
        { id: "os-exp-7", title: "Disk Scheduling", difficulty: "Easy", href: "/dashboard/os/os-exp-7", description: "Simulate FCFS, SSTF, SCAN, and C-SCAN disk scheduling.", duration: "45 mins" },
    ],
    dbms: [
        { id: "dbms-exp-1", title: "Introduction to DBMS", difficulty: "Easy", href: "/dashboard/dbms/dbms-exp-1", description: "Introduction to database concepts, ACID properties, and basic SQL queries.", duration: "45 mins" },
        { id: "dbms-exp-2", title: "Application Development", difficulty: "Medium", href: "/dashboard/dbms/dbms-exp-2", description: "Build an E-R model and map it to a relational schema.", duration: "60 mins" },
        { id: "dbms-exp-3", title: "Relational Algebra", difficulty: "Hard", href: "/dashboard/dbms/dbms-exp-3", description: "Practice Relational Algebra operations and functional dependencies.", duration: "55 mins" },
        { id: "dbms-exp-4", title: "Normalization", difficulty: "Hard", href: "/dashboard/dbms/dbms-exp-4", description: "Apply normalization up to BCNF to reduce data redundancy.", duration: "60 mins" },
        { id: "dbms-exp-5", title: "Host Language Integration", difficulty: "Medium", href: "/dashboard/dbms/dbms-exp-5", description: "Embed SQL in C/Java programs using cursors and transactions.", duration: "50 mins" },
    ],
    dsa: [
        { id: "dsa-exp-1", title: "Sorting Algorithms", difficulty: "Easy", href: "/dashboard/dsa/dsa-exp-1", description: "Visualize and compare Bubble, Merge, Quick, and Heap Sort.", duration: "45 mins" },
        { id: "dsa-exp-2", title: "Binary Search Trees", difficulty: "Medium", href: "/dashboard/dsa/dsa-exp-2", description: "Implement BST operations: insert, delete, search, and traversals.", duration: "50 mins" },
        { id: "dsa-exp-3", title: "Graph Algorithms", difficulty: "Hard", href: "/dashboard/dsa/dsa-exp-3", description: "Implement BFS, DFS, Dijkstra's, and Kruskal's algorithms.", duration: "60 mins" },
        { id: "dsa-exp-4", title: "Dynamic Programming", difficulty: "Hard", href: "/dashboard/dsa/dsa-exp-4", description: "Solve classic DP problems: Knapsack, LCS, Matrix Chain.", duration: "65 mins" },
        { id: "dsa-exp-5", title: "Hashing Techniques", difficulty: "Medium", href: "/dashboard/dsa/dsa-exp-5", description: "Implement hash tables with chaining and open addressing.", duration: "50 mins" },
    ],
    dld: [
        { id: "dld-exp-1", title: "Logic Gates & Boolean Algebra", difficulty: "Easy", href: "/dashboard/dld/dld-exp-1", description: "Design and simulate combinational circuits using logic gates.", duration: "45 mins" },
        { id: "dld-exp-2", title: "Combinational Circuits", difficulty: "Medium", href: "/dashboard/dld/dld-exp-2", description: "Build Half Adder, Full Adder, Multiplexer, and Decoder circuits.", duration: "50 mins" },
        { id: "dld-exp-3", title: "Sequential Circuits", difficulty: "Hard", href: "/dashboard/dld/dld-exp-3", description: "Design Flip-Flops, Registers, and Counters.", duration: "55 mins" },
        { id: "dld-exp-4", title: "Karnaugh Map Minimization", difficulty: "Medium", href: "/dashboard/dld/dld-exp-4", description: "Minimize Boolean expressions using K-Maps.", duration: "45 mins" },
        { id: "dld-exp-5", title: "Circuit Canvas", difficulty: "Easy", href: "/dashboard/dld/dld-exp-5", description: "Free-form digital circuit design and simulation.", duration: "60 mins" },
    ],
    oops: [
        { id: "oops-exp-1", title: "OOP Concepts in Java", difficulty: "Easy", href: "/dashboard/oops/oops-exp-1", description: "Practice Encapsulation, Inheritance, Polymorphism, and Abstraction.", duration: "50 mins" },
        { id: "oops-exp-2", title: "Design Patterns", difficulty: "Hard", href: "/dashboard/oops/oops-exp-2", description: "Implement Singleton, Factory, and Observer design patterns.", duration: "65 mins" },
        { id: "oops-exp-3", title: "Exception Handling", difficulty: "Medium", href: "/dashboard/oops/oops-exp-3", description: "Handle checked and unchecked exceptions in Java programs.", duration: "45 mins" },
        { id: "oops-exp-4", title: "Collections Framework", difficulty: "Medium", href: "/dashboard/oops/oops-exp-4", description: "Work with ArrayList, HashMap, LinkedList and other Java collections.", duration: "50 mins" },
        { id: "oops-exp-5", title: "Multithreading in Java", difficulty: "Hard", href: "/dashboard/oops/oops-exp-5", description: "Implement threads, synchronization, and concurrent programming.", duration: "60 mins" },
    ],
    mpmc: [
        { id: "mpmc-exp-1", title: "8086 Assembly Programming", difficulty: "Medium", href: "/dashboard/mpmc/mpmc-exp-1", description: "Write and execute 8086 assembly language programs.", duration: "60 mins" },
        { id: "mpmc-exp-2", title: "Interfacing with 8255 PPI", difficulty: "Hard", href: "/dashboard/mpmc/mpmc-exp-2", description: "Interface external devices using 8255 Programmable Peripheral Interface.", duration: "65 mins" },
        { id: "mpmc-exp-3", title: "Interrupt Programming", difficulty: "Hard", href: "/dashboard/mpmc/mpmc-exp-3", description: "Implement hardware and software interrupts in 8086.", duration: "60 mins" },
        { id: "mpmc-exp-4", title: "8086 Arithmetic Instructions", difficulty: "Easy", href: "/dashboard/mpmc/mpmc-exp-4", description: "Practice ADD, SUB, MUL, DIV instructions on 8086.", duration: "45 mins" },
        { id: "mpmc-exp-5", title: "8253 Timer Interfacing", difficulty: "Hard", href: "/dashboard/mpmc/mpmc-exp-5", description: "Interface 8253 Programmable Interval Timer with 8086.", duration: "60 mins" },
    ],
    daa: [
        { id: "daa-exp-1", title: "Algorithm Analysis & Complexity", difficulty: "Medium", href: "/dashboard/daa/daa-exp-1", description: "Analyze time and space complexity using Big-O, Omega, and Theta notations.", duration: "45 mins" },
        { id: "daa-exp-2", title: "Divide and Conquer", difficulty: "Hard", href: "/dashboard/daa/daa-exp-2", description: "Implement Merge Sort, Quick Sort, and Strassen's matrix multiplication.", duration: "60 mins" },
        { id: "daa-exp-3", title: "Greedy Algorithms", difficulty: "Medium", href: "/dashboard/daa/daa-exp-3", description: "Solve problems using greedy approach: MST, Huffman Coding.", duration: "55 mins" },
        { id: "daa-exp-4", title: "Dynamic Programming", difficulty: "Hard", href: "/dashboard/daa/daa-exp-4", description: "Solve DP problems: 0/1 Knapsack, LCS, Floyd-Warshall.", duration: "65 mins" },
        { id: "daa-exp-5", title: "NP-Completeness", difficulty: "Hard", href: "/dashboard/daa/daa-exp-5", description: "Understand P, NP, NP-Complete and NP-Hard problem classes.", duration: "50 mins" },
        { id: "daa-exp-6", title: "Backtracking Algorithms", difficulty: "Hard", href: "/dashboard/daa/daa-exp-6", description: "Solve N-Queens, Graph Coloring, and Subset Sum using backtracking.", duration: "55 mins" },
        { id: "daa-exp-7", title: "Branch and Bound", difficulty: "Hard", href: "/dashboard/daa/daa-exp-7", description: "Solve Travelling Salesman Problem and 0/1 Knapsack with Branch and Bound.", duration: "60 mins" },
        { id: "daa-exp-8", title: "String Matching Algorithms", difficulty: "Medium", href: "/dashboard/daa/daa-exp-8", description: "Implement Naive, KMP, and Rabin-Karp string matching algorithms.", duration: "50 mins" },
    ],
    pds: [
        { id: "pds-exp-1", title: "Introduction to C Programming", difficulty: "Easy", href: "/dashboard/pds/pds-exp-1", description: "Basic C programs: data types, operators, and I/O.", duration: "40 mins" },
        { id: "pds-exp-2", title: "Control Flow Statements", difficulty: "Easy", href: "/dashboard/pds/pds-exp-2", description: "Implement if-else, switch, for, while, do-while in C.", duration: "40 mins" },
        { id: "pds-exp-3", title: "Functions & Recursion", difficulty: "Medium", href: "/dashboard/pds/pds-exp-3", description: "Write recursive functions for factorial, fibonacci, and GCD.", duration: "45 mins" },
        { id: "pds-exp-4", title: "Arrays & Strings", difficulty: "Medium", href: "/dashboard/pds/pds-exp-4", description: "Manipulate 1D/2D arrays and string operations in C.", duration: "45 mins" },
        { id: "pds-exp-5", title: "Pointers & Memory", difficulty: "Hard", href: "/dashboard/pds/pds-exp-5", description: "Understand pointers, pointer arithmetic, and dynamic memory.", duration: "55 mins" },
        { id: "pds-exp-6", title: "Structures & Unions", difficulty: "Medium", href: "/dashboard/pds/pds-exp-6", description: "Define and use structs, unions, and enums in C.", duration: "45 mins" },
        { id: "pds-exp-7", title: "File I/O in C", difficulty: "Medium", href: "/dashboard/pds/pds-exp-7", description: "Read and write files using file pointers and standard functions.", duration: "50 mins" },
        { id: "pds-exp-8", title: "Linked Lists", difficulty: "Hard", href: "/dashboard/pds/pds-exp-8", description: "Implement singly and doubly linked lists with all operations.", duration: "60 mins" },
        { id: "pds-exp-9", title: "Stacks and Queues", difficulty: "Medium", href: "/dashboard/pds/pds-exp-9", description: "Implement Stack and Queue using arrays and linked lists.", duration: "50 mins" },
        { id: "pds-exp-10", title: "Trees & Binary Trees", difficulty: "Hard", href: "/dashboard/pds/pds-exp-10", description: "Implement Binary Tree with insertion, deletion, and traversals.", duration: "60 mins" },
    ],
    cd: [
        { id: "cd-exp-1", title: "Lexical Analysis", difficulty: "Hard", href: "/dashboard/cd/cd-exp-1", description: "Implement a lexer/scanner using regular expressions and finite automata.", duration: "60 mins" },
        { id: "cd-exp-2", title: "Regular Expressions & DFA", difficulty: "Medium", href: "/dashboard/cd/cd-exp-2", description: "Convert regular expressions to NFA and DFA.", duration: "55 mins" },
        { id: "cd-exp-3", title: "Context-Free Grammars", difficulty: "Hard", href: "/dashboard/cd/cd-exp-3", description: "Design and simplify Context-Free Grammars for programming constructs.", duration: "60 mins" },
        { id: "cd-exp-4", title: "Top-Down Parsing", difficulty: "Hard", href: "/dashboard/cd/cd-exp-4", description: "Implement recursive descent and predictive (LL(1)) parsers.", duration: "65 mins" },
        { id: "cd-exp-5", title: "Bottom-Up Parsing", difficulty: "Hard", href: "/dashboard/cd/cd-exp-5", description: "Implement LR(0), SLR(1), and CLR(1) parsers.", duration: "65 mins" },
        { id: "cd-exp-6", title: "Intermediate Code Generation", difficulty: "Hard", href: "/dashboard/cd/cd-exp-6", description: "Generate Three-Address Code and quadruples from expressions.", duration: "60 mins" },
        { id: "cd-exp-7", title: "Code Optimization", difficulty: "Hard", href: "/dashboard/cd/cd-exp-7", description: "Apply peephole optimization, DAG representation, and loop optimization.", duration: "55 mins" },
    ],
    ot: [
        { id: "ot-exp-1", title: "Linear Programming", difficulty: "Medium", href: "/dashboard/ot/ot-exp-1", description: "Solve LP problems using Simplex method and graphical method.", duration: "55 mins" },
        { id: "ot-exp-2", title: "Transportation Problem", difficulty: "Medium", href: "/dashboard/ot/ot-exp-2", description: "Apply North-West Corner, Least Cost, and Vogel's methods.", duration: "50 mins" },
        { id: "ot-exp-3", title: "Assignment Problem", difficulty: "Medium", href: "/dashboard/ot/ot-exp-3", description: "Solve assignment problems using Hungarian algorithm.", duration: "45 mins" },
        { id: "ot-exp-4", title: "Game Theory", difficulty: "Hard", href: "/dashboard/ot/ot-exp-4", description: "Solve two-person zero-sum games using minimax and mixed strategies.", duration: "55 mins" },
        { id: "ot-exp-5", title: "Network Flow Optimization", difficulty: "Hard", href: "/dashboard/ot/ot-exp-5", description: "Apply Max-Flow Min-Cut theorem and Ford-Fulkerson algorithm.", duration: "60 mins" },
        { id: "ot-exp-6", title: "Queuing Theory", difficulty: "Hard", href: "/dashboard/ot/ot-exp-6", description: "Analyze M/M/1, M/M/s queuing models for system optimization.", duration: "55 mins" },
    ],
    bee: [
        { id: "bee-exp-1", title: "DC Circuit Analysis", difficulty: "Easy", href: "/dashboard/bee/bee-exp-1", description: "Apply KVL, KCL, and mesh/nodal analysis to DC circuits.", duration: "45 mins" },
        { id: "bee-exp-2", title: "AC Circuit Analysis", difficulty: "Medium", href: "/dashboard/bee/bee-exp-2", description: "Analyze AC circuits with resistance, inductance, and capacitance.", duration: "50 mins" },
        { id: "bee-exp-3", title: "Resonance Circuits", difficulty: "Medium", href: "/dashboard/bee/bee-exp-3", description: "Study series and parallel resonance in AC circuits.", duration: "45 mins" },
        { id: "bee-exp-4", title: "Transformer Analysis", difficulty: "Medium", href: "/dashboard/bee/bee-exp-4", description: "Analyze single-phase transformers: turns ratio, efficiency, and losses.", duration: "50 mins" },
        { id: "bee-exp-5", title: "DC Machine Analysis", difficulty: "Hard", href: "/dashboard/bee/bee-exp-5", description: "Analyze DC motors and generators: characteristics and performance.", duration: "55 mins" },
        { id: "bee-exp-6", title: "AC Machine Analysis", difficulty: "Hard", href: "/dashboard/bee/bee-exp-6", description: "Study three-phase induction motor and synchronous machine.", duration: "60 mins" },
    ],
    "error-detection": [
        { id: "error-detection-exp-1", title: "CRC Error Detection", difficulty: "Medium", href: "/dashboard/error-detection/error-detection-exp-1", description: "Implement Cyclic Redundancy Check for error detection in data transmission.", duration: "45 mins" },
        { id: "error-detection-exp-2", title: "Checksum Method", difficulty: "Easy", href: "/dashboard/error-detection/error-detection-exp-2", description: "Apply Internet checksum for error detection in network protocols.", duration: "40 mins" },
        { id: "error-detection-exp-3", title: "Hamming Code", difficulty: "Hard", href: "/dashboard/error-detection/error-detection-exp-3", description: "Implement Hamming code for single-bit error detection and correction.", duration: "55 mins" },
        { id: "error-detection-exp-4", title: "Parity Check", difficulty: "Easy", href: "/dashboard/error-detection/error-detection-exp-4", description: "Implement even and odd parity checking for error detection.", duration: "35 mins" },
    ],
    coa: [
        { id: "coa-exp-1", title: "Basic Computer Organization", difficulty: "Easy", href: "/dashboard/coa/coa-exp-1", description: "Study registers, buses, ALU, and control unit of a basic computer.", duration: "45 mins" },
        { id: "coa-exp-2", title: "Instruction Set Architecture", difficulty: "Medium", href: "/dashboard/coa/coa-exp-2", description: "Design and simulate a basic instruction set and addressing modes.", duration: "55 mins" },
        { id: "coa-exp-3", title: "Pipelining", difficulty: "Hard", href: "/dashboard/coa/coa-exp-3", description: "Study instruction pipelining, hazards, and forwarding techniques.", duration: "60 mins" },
        { id: "coa-exp-4", title: "Cache Memory", difficulty: "Hard", href: "/dashboard/coa/coa-exp-4", description: "Implement direct-mapped, set-associative, and fully-associative cache.", duration: "60 mins" },
        { id: "coa-exp-5", title: "Memory Organization", difficulty: "Medium", href: "/dashboard/coa/coa-exp-5", description: "Study memory hierarchy: cache, RAM, ROM, and virtual memory.", duration: "50 mins" },
        { id: "coa-exp-6", title: "I/O Organization", difficulty: "Medium", href: "/dashboard/coa/coa-exp-6", description: "Study programmed I/O, interrupt-driven I/O, and DMA.", duration: "50 mins" },
        { id: "coa-exp-7", title: "Arithmetic Operations in Hardware", difficulty: "Hard", href: "/dashboard/coa/coa-exp-7", description: "Implement addition, subtraction, multiplication circuits using logic gates.", duration: "60 mins" },
        { id: "coa-exp-8", title: "Floating Point Representation", difficulty: "Hard", href: "/dashboard/coa/coa-exp-8", description: "Study IEEE 754 floating-point format and arithmetic operations.", duration: "55 mins" },
    ],
};

export default function SubjectDashboardPage() {
    const params = useParams();
    const subjectSlug = params.subject as string;

    const [subject, setSubject] = useState<any>(null);
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                const [subRes, expRes] = await Promise.allSettled([
                    fetch(`${API_URL}/api/subjects`, { signal: controller.signal }),
                    fetch(`${API_URL}/api/experiments?subject=${subjectSlug}`, { signal: controller.signal }),
                ]);
                clearTimeout(timeoutId);

                if (subRes.status === "fulfilled" && subRes.value.ok) {
                    const subjects = await subRes.value.json();
                    const sub = subjects.find((s: any) => s.slug === subjectSlug || s._id === subjectSlug || s.id === subjectSlug);
                    if (sub) setSubject(sub);
                }

                if (expRes.status === "fulfilled" && expRes.value.ok) {
                    const expData = await expRes.value.json();
                    if (expData.length > 0) {
                        setExperiments(expData.map((e: any) => ({
                            id: e._id || e.id,
                            title: e.title,
                            difficulty: e.difficulty || "Medium",
                            href: `/dashboard/${subjectSlug}/${e.slug || e.id || e._id}`,
                            description: e.description,
                            duration: e.duration || "45 mins",
                        })));
                        return;
                    }
                }
                throw new Error("use fallback");
            } catch {
                // Use offline fallback — look up by slug, also try common aliases
                const slug = subjectSlug?.toLowerCase();
                const fallback =
                    SUBJECT_EXPERIMENTS[slug] ||
                    SUBJECT_EXPERIMENTS[slug?.replace("-", "")] ||
                    [];
                setExperiments(fallback);
            } finally {
                setLoading(false);
            }
        };
        if (subjectSlug) fetchData();
    }, [subjectSlug]);

    const filteredExperiments = experiments.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterDifficulty ? exp.difficulty === filterDifficulty : true;
        return matchesSearch && matchesFilter;
    });

    const subjectTitle = subject?.title || subjectSlug?.toUpperCase() || "Lab";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <Navbar />

            <main className="container mx-auto px-4 pt-28 pb-20 max-w-7xl">
                <Button
                    variant="ghost"
                    onClick={() => window.location.href = "/dashboard"}
                    className="flex items-center gap-2 mb-6 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 font-bold uppercase tracking-widest text-[10px]"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </Button>

                <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-left duration-500">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                            {subjectTitle} <span className="text-blue-600 italic">Lab</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            {subject?.description || `Explore and practice experiments for ${subjectTitle}.`}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-8">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search experiments..."
                            className="w-full pl-4 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {[null, "Easy", "Medium", "Hard"].map((diff) => (
                            <Button
                                key={diff ?? "all"}
                                variant={filterDifficulty === diff ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterDifficulty(diff)}
                                className={
                                    diff === null ? "" :
                                    diff === "Easy" ? (filterDifficulty === "Easy" ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-200 hover:bg-green-50") :
                                    diff === "Medium" ? (filterDifficulty === "Medium" ? "bg-amber-500 hover:bg-amber-600" : "text-amber-600 border-amber-200 hover:bg-amber-50") :
                                    (filterDifficulty === "Hard" ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-200 hover:bg-red-50")
                                }
                            >
                                {diff ?? "All"}
                            </Button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                ) : filteredExperiments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <h3 className="text-lg font-bold text-slate-500">No experiments found</h3>
                        <p className="text-slate-400">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExperiments.map((exp) => (
                            <div key={exp.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col group">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                            exp.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                                            exp.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
                                            "bg-red-100 text-red-700"
                                        }`}>
                                            {exp.difficulty}
                                        </span>
                                        <BarChart className="w-4 h-4 text-slate-400" />
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                        {exp.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                        {exp.description || "Master this concept through interactive simulation and real-time analysis."}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {exp.duration || "45 mins"}
                                        </span>
                                        <span>•</span>
                                        <span>30 Test Questions</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                                    <a href={exp.href} className="w-full block">
                                        <Button className="w-full gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            Start Experiment <PlayCircle className="w-4 h-4" />
                                        </Button>
                                    </a>
                                    {/* Take Test — opens experiment page and auto-switches to test tab */}
                                    <a href={`${exp.href}#test`} className="w-full block" onClick={(e) => {
                                        e.preventDefault();
                                        // Store intent to open test tab in sessionStorage, then navigate
                                        sessionStorage.setItem("openTab", "test");
                                        window.location.href = exp.href;
                                    }}>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-400 text-xs font-black uppercase tracking-wider transition-all"
                                        >
                                            <ClipboardList className="w-3.5 h-3.5" /> Take Test · 30Q
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

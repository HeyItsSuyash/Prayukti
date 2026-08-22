"use client";

import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimulationRenderer from "@/components/simulation/SimulationRenderer";
import { ExecutionInsights } from "@/components/simulation/core/ExecutionInsights";
import CodeCompiler from "@/components/simulation/core/CodeCompiler";
import LabTest from "@/components/simulation/core/LabTest";
import { ChevronRight } from "lucide-react";

const getSubjectName = (id: string) => {
    const lower = id.toLowerCase();
    if (lower.startsWith('cn')) return "Computer Networks";
    if (lower.startsWith('dsa') || lower.startsWith('data')) return "Data Structures & Algorithms";
    if (lower.startsWith('dbms')) return "Database Management Systems";
    if (lower.startsWith('oops') || lower.startsWith('java')) return "Object Oriented Programming";
    if (lower.startsWith('dld') || lower.startsWith('digital')) return "Digital Logic Design";
    if (lower.startsWith('os')) return "Operating Systems";
    if (lower.startsWith('mpmc') || lower.startsWith('micro')) return "Microprocessors & Microcontrollers";
    if (lower.startsWith('daa')) return "Design & Analysis of Algorithms";
    if (lower.startsWith('pds')) return "Programming & Data Structures";
    if (lower.startsWith('cd')) return "Compiler Design";
    if (lower.startsWith('ot')) return "Optimization Techniques";
    if (lower.startsWith('bee')) return "Basic Electrical Engineering";
    if (lower.startsWith('coa') || lower.startsWith('aca')) return "Computer Organization & Architecture";
    if (lower.startsWith('error-detection')) return "Error Detection";
    return "Virtual Lab Assessment";
};

const getExperimentAcademicDetails = (id: string) => {
    const key = id.toLowerCase();
    
    const store: Record<string, { aim: string; theoryParagraphs: string[]; referencesList: string[] }> = {
        // DBMS
        "dbms-exp-1": {
            aim: "To study and understand the fundamental concepts of Database Management Systems, transaction properties (ACID), and basic query execution.",
            theoryParagraphs: [
                "A Database Management System (DBMS) is software designed to store, retrieve, and manage data efficiently, offering data independence and concurrent multi-user execution.",
                "Database transactions are guaranteed via ACID properties: Atomicity (all-or-nothing execution), Consistency (maintaining database constraints), Isolation (independent concurrent execution), and Durability (persistence of committed changes).",
                "SQL queries are written in DDL (Data Definition Language like CREATE, ALTER) and DML (Data Manipulation Language like SELECT, INSERT, UPDATE, DELETE) to define and manipulate tables."
            ],
            referencesList: [
                "Database System Concepts by Abraham Silberschatz, Henry F. Korth, and S. Sudarshan (6th Edition).",
                "Fundamentals of Database Systems by Ramez Elmasri and Shamkant B. Navathe (7th Edition)."
            ]
        },
        "dbms-exp-2": {
            aim: "To design an Entity-Relationship (E-R) diagram for a real-world scenario and map the schema into relational database tables.",
            theoryParagraphs: [
                "The Entity-Relationship (E-R) model is a conceptual data model representing real-world entities (rectangles), their properties or attributes (ovals), and relationships (diamonds).",
                "During database design, the conceptual E-R model is mapped to a relational schema: strong entity sets become tables, and relationships are mapped using foreign keys or distinct junction tables for many-to-many relationships."
            ],
            referencesList: [
                "Database System Concepts by Abraham Silberschatz, Henry F. Korth, and S. Sudarshan.",
                "Database Management Systems by Raghu Ramakrishnan and Johannes Gehrke."
            ]
        },
        "dbms-exp-3": {
            aim: "To study, practice, and execute Relational Algebra operations (Selection, Projection, and Joins) and understand Functional Dependencies.",
            theoryParagraphs: [
                "Relational Algebra is a procedural query language that acts on relations to produce new relations. Basic operators include Selection (σ, selects rows), Projection (π, selects columns), and Cartesian Product (x).",
                "Joins (⋈) combine related tuples across tables. Outer Joins (Left, Right, Full) preserve unmatched tuples by padding missing fields with NULL values."
            ],
            referencesList: [
                "Database System Concepts by Abraham Silberschatz, Henry F. Korth, and S. Sudarshan.",
                "Fundamentals of Database Systems by Ramez Elmasri and Shamkant B. Navathe."
            ]
        },
        "dbms-exp-4": {
            aim: "To study and apply normalization rules up to BCNF (Boyce-Codd Normal Form) to minimize database redundancy and anomalies.",
            theoryParagraphs: [
                "Normalization organizes schemas to eliminate anomalies (insert, delete, update) and minimize redundancy using functional dependencies.",
                "Key normal forms include: 1NF (atomic attributes), 2NF (no partial dependencies on candidate keys), 3NF (no transitive dependencies), and BCNF (every determinant is a candidate key)."
            ],
            referencesList: [
                "Database System Concepts by Abraham Silberschatz, Henry F. Korth, and S. Sudarshan.",
                "Fundamentals of Database Systems by Ramez Elmasri and Shamkant B. Navathe."
            ]
        },
        "dbms-exp-5": {
            aim: "To study host language integration mechanisms and execute transactional logic using embedded SQL and cursors.",
            theoryParagraphs: [
                "Embedded SQL allows standard programming languages (like C, Java) to issue direct database commands. Data is shared using shared host variables.",
                "Cursors allow host languages to process database result sets row-by-row, while transactional controls (COMMIT, ROLLBACK) manage database transaction state."
            ],
            referencesList: [
                "Oracle Database SQL Language Reference.",
                "Database System Concepts by Abraham Silberschatz, Henry F. Korth, and S. Sudarshan."
            ]
        },
        // DLD
        "dld-exp-1": {
            aim: "To study, construct, and verify the truth tables of basic digital logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR).",
            theoryParagraphs: [
                "Logic gates are the fundamental building blocks of digital logic. AND, OR, and NOT are basic gates. NAND and NOR are universal gates since any logic expression can be built using only NAND/NOR gates.",
                "Derived gates include XOR (exclusive-OR, outputs high if inputs differ) and XNOR (exclusive-NOR, outputs high if inputs are identical)."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti (6th Edition).",
                "Digital Fundamentals by Thomas L. Floyd (11th Edition)."
            ]
        },
        "dld-exp-2": {
            aim: "To design and construct Half Adder and Full Adder combinational circuits and verify their Sum and Carry logic.",
            theoryParagraphs: [
                "Adders perform arithmetic addition of binary numbers. A Half Adder adds two 1-bit inputs: Sum = A ⊕ B, Carry = A . B.",
                "A Full Adder adds three 1-bit inputs (including a Carry-in): Sum = A ⊕ B ⊕ Cin, Carry-out = A.B + Cin(A ⊕ B)."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Systems: Principles and Applications by Ronald J. Tocci."
            ]
        },
        "dld-exp-3": {
            aim: "To design and construct Half Subtractor and Full Subtractor combinational circuits and verify Difference and Borrow logic.",
            theoryParagraphs: [
                "Subtractors execute binary subtraction. A Half Subtractor subtracts input B from A: Difference = A ⊕ B, Borrow = A' . B.",
                "A Full Subtractor subtracts B and Borrow-in Bin from A: Difference = A ⊕ B ⊕ Bin, Borrow-out = A'B + Bin(A ⊕ B)'."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Fundamentals by Thomas L. Floyd."
            ]
        },
        "dld-exp-4": {
            aim: "To design and implement Binary to Gray and Gray to Binary code converter combinational circuits.",
            theoryParagraphs: [
                "Code converters translate between representation formats. Gray code is a unit-distance code where only one bit changes between successive values.",
                "Binary-to-Gray uses XOR gates: G[i] = B[i] ⊕ B[i+1]. Gray-to-Binary reconstructs values sequentially: B[i] = B[i+1] ⊕ G[i]."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Systems: Principles and Applications by Ronald J. Tocci."
            ]
        },
        "dld-exp-5": {
            aim: "To simplify and implement logic expressions using Sum of Products (SOP) format and Karnaugh maps.",
            theoryParagraphs: [
                "SOP represents boolean functions as sum (OR) of product (AND) terms. Karnaugh maps (K-Maps) group adjacent minterms to simplify expressions, reducing logic gate counts and propagation delays."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Fundamentals by Thomas L. Floyd."
            ]
        },
        "dld-exp-6": {
            aim: "To design and verify the truth table of Decoder (2-to-4) and Encoder (4-to-2) combinational circuits.",
            theoryParagraphs: [
                "Decoders convert N-bit inputs into a maximum of 2^N unique active output lines (representing minterms).",
                "Encoders perform the inverse operation, converting an active input line back into an N-bit binary code representation."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Systems: Principles and Applications by Ronald J. Tocci."
            ]
        },
        "dld-exp-7": {
            aim: "To design and verify Multiplexer (4-to-1) and Demultiplexer (1-to-4) combinational logic circuits.",
            theoryParagraphs: [
                "A Multiplexer (MUX) selects one of 2^N data inputs and forwards it to a single output line based on N select lines.",
                "A Demultiplexer (DEMUX) takes a single data input and routes it to one of 2^N outputs based on select line inputs."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Fundamentals by Thomas L. Floyd."
            ]
        },
        "dld-exp-8": {
            aim: "To design and construct Magnitude Comparator circuits to compare the relative values of binary numbers.",
            theoryParagraphs: [
                "Magnitude Comparators determine whether number A is greater than, less than, or equal to number B.",
                "A 1-bit comparator uses simple gates: (A > B) = A.B', (A < B) = A'.B, and (A = B) = A ⊙ B (XNOR)."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Systems: Principles and Applications by Ronald J. Tocci."
            ]
        },
        "dld-exp-9": {
            aim: "To study and verify truth tables and state transitions of SR, JK, D, and T flip-flops.",
            theoryParagraphs: [
                "Flip-flops are bistable sequential elements that store 1-bit of state. SR flip-flops have an invalid state when S=R=1.",
                "JK flip-flops resolve the SR conflict by toggling state when J=K=1. D flip-flops capture input state, and T flip-flops toggle state."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Fundamentals by Thomas L. Floyd."
            ]
        },
        "dld-exp-10": {
            aim: "To design and construct Synchronous and Asynchronous (Ripple) digital counters.",
            theoryParagraphs: [
                "Counters cycle through states on clock triggers. Asynchronous counters ripple the clock sequentially through flip-flops.",
                "Synchronous counters apply the clock to all flip-flops concurrently, eliminating ripple delays and skew errors."
            ],
            referencesList: [
                "Digital Design by M. Morris Mano and Michael D. Ciletti.",
                "Digital Fundamentals by Thomas L. Floyd."
            ]
        },
        // CN
        "cn-exp-1": {
            aim: "To study, analyze, and compare the layers and abstractions of OSI and TCP/IP reference models.",
            theoryParagraphs: [
                "OSI is a theoretical 7-layer model (Physical, Data Link, Network, Transport, Session, Presentation, Application) detailing separation of network protocols.",
                "TCP/IP is a practical 4-layer model (Link, Internet, Transport, Application) that underpins the internet protocol suite."
            ],
            referencesList: [
                "Computer Networks by Andrew S. Tanenbaum and David J. Wetherall (5th Edition).",
                "Computer Networking: A Top-Down Approach by James F. Kurose and Keith W. Ross (7th Edition)."
            ]
        },
        "cn-exp-2": {
            aim: "To study and simulate Carrier Sense Multiple Access with Collision Detection (CSMA/CD) protocol operations.",
            theoryParagraphs: [
                "CSMA/CD is a MAC layer protocol. Stations listen to the channel before transmitting (Carrier Sense) and monitor for collisions during transmission.",
                "Upon detecting a collision, stations jam the channel, stop transmitting, and wait a random backoff time using Binary Exponential Backoff."
            ],
            referencesList: [
                "Computer Networks by Andrew S. Tanenbaum.",
                "Data and Computer Communications by William Stallings (10th Edition)."
            ]
        },
        "cn-exp-3": {
            aim: "To study and simulate Address Resolution Protocol (ARP) IP-to-MAC resolution broadcasts and unicasts.",
            theoryParagraphs: [
                "ARP maps 32-bit IPv4 addresses to 48-bit physical MAC addresses. A host broadcasts an ARP Request, and the target unicasts an ARP Reply."
            ],
            referencesList: [
                "Computer Networking: A Top-Down Approach by James F. Kurose and Keith W. Ross.",
                "RFC 826 - An Ethernet Address Resolution Protocol."
            ]
        },
        "cn-exp-4": {
            aim: "To study and simulate Distance Vector Routing (DVR) table convergence using the Bellman-Ford algorithm.",
            theoryParagraphs: [
                "DVR calculates shortest path vectors. Routers exchange lists of estimated distances periodically with immediate neighbors.",
                "Common issues like Count-to-Infinity are resolved using Split Horizon and Poison Reverse routing updates."
            ],
            referencesList: [
                "Computer Networks by Andrew S. Tanenbaum.",
                "Routing TCP/IP, Volume 1 by Jeff Doyle."
            ]
        },
        "cn-exp-5": {
            aim: "To simulate Selective Repeat ARQ flow and error control window operations.",
            theoryParagraphs: [
                "Selective Repeat ARQ retransmits only corrupted or lost frames (using selective ACKs or NAKs).",
                "The receiver buffers out-of-order frames, sorting and delivering them sequentially to the network layer."
            ],
            referencesList: [
                "Computer Networking: A Top-Down Approach by James F. Kurose and Keith W. Ross.",
                "Data and Computer Communications by William Stallings."
            ]
        },
        "cn-exp-6": {
            aim: "To study flow control sliding window protocols (Go-Back-N and Selective Repeat) and window size constraints.",
            theoryParagraphs: [
                "Sliding window protocols allow sending multiple unacknowledged packets to maximize channel capacity utilization.",
                "The window size limits the number of active packets in transit. Go-Back-N retransmits all frames from the point of error, whereas Selective Repeat only retries failed packets."
            ],
            referencesList: [
                "Computer Networks by Andrew S. Tanenbaum.",
                "Computer Networking: A Top-Down Approach by James F. Kurose and Keith W. Ross."
            ]
        },
        "cn-exp-7": {
            aim: "To study and simulate token-passing media access control protocols in Ring topology networks.",
            theoryParagraphs: [
                "Token Ring (IEEE 802.5) and FDDI pass a special token frame sequentially around nodes in a ring topology.",
                "A node can transmit data frames only when it captures the token, ensuring zero-collision channel access."
            ],
            referencesList: [
                "Computer Networks by Andrew S. Tanenbaum.",
                "Data and Computer Communications by William Stallings."
            ]
        }
    };

    return store[key] || {
        aim: "To study and analyze the core concepts of this experiment.",
        theoryParagraphs: ["Detailed theory paragraphs will be loaded shortly."],
        referencesList: ["Academic references and manuals will be updated soon."]
    };
};

const SECTIONS = [
    { id: "aim", label: "Aim" },
    { id: "theory", label: "Theory" },
    { id: "simulation", label: "Simulation" },
    { id: "test", label: "Test" },
    { id: "references", label: "References" }
];

function ExperimentPageContent({ id }: { id: string }) {
    const [experiment, setExperiment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // IDE state
    const [output, setOutput] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [code, setCode] = useState("");
    const [currentLanguage, setCurrentLanguage] = useState("c");
    const [compilerError, setCompilerError] = useState<string | null>(null);
    const [customInput, setCustomInput] = useState("");
    const [complexityData, setComplexityData] = useState<any>(null);

    // Sidebar state
    const [activeSection, setActiveSection] = useState("aim");
    const [simulationStarted, setSimulationStarted] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const intent = sessionStorage.getItem("openTab");
            if (intent) {
                // Map 'test' intent to test
                if (intent === 'test') setActiveSection('test');
                else setActiveSection(intent);
                sessionStorage.removeItem("openTab");
            }
        }
    }, []);

    useEffect(() => {
        if (output?.status?.description === "Accepted" && !isCompleted) {
            setIsCompleted(true);
        }
    }, [output, isCompleted]);

    useEffect(() => {
        const fetchExperiment = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const res = await fetch(`${API_URL}/api/experiments/${id}`, { signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await res.ok ? await res.json() : null;
                
                const applyFallback = () => {
                    console.warn("[VLAB] Backend unreachable or missing data, using fallback experiment data for ID:", id);
                    let fallbackTitle = "Experiment Simulation";
                    if (id === 'cn-exp-1') fallbackTitle = 'OSI vs TCP/IP Reference Models';
                    else if (id === 'cn-exp-2') fallbackTitle = 'CSMA/CD Protocol Simulation';
                    else if (id === 'cn-exp-3') fallbackTitle = 'ARP Protocol Simulation';
                    else if (id === 'cn-exp-4') fallbackTitle = 'Distance Vector Routing';
                    else if (id === 'cn-exp-5') fallbackTitle = 'Selective Repeat Simulation';
                    else if (id === 'cn-exp-6') fallbackTitle = 'Sliding Window Simulation';
                    else if (id === 'cn-exp-7') fallbackTitle = 'Token Protocols Simulation';
                    else if (id === 'dbms-exp-1') fallbackTitle = 'Introduction to DBMS';
                    else if (id === 'dbms-exp-2') fallbackTitle = 'Application Development';
                    else if (id === 'dbms-exp-3') fallbackTitle = 'Relational Algebra';
                    else if (id === 'dbms-exp-4') fallbackTitle = 'Normalization';
                    else if (id === 'dbms-exp-5') fallbackTitle = 'Host Language Integration';
                    else if (id.startsWith('error-detection')) fallbackTitle = 'Error Detection Simulation';
                    else if (id.startsWith('daa')) fallbackTitle = 'Algorithm Analysis';
                    else if (id.startsWith('mpmc')) fallbackTitle = '8086 Simulator';
                    else if (id.startsWith('dld')) fallbackTitle = 'Circuit Canvas';
                    else if (id.startsWith('oops')) fallbackTitle = 'Java Compiler';
                    
                    setExperiment({
                        id,
                        title: fallbackTitle,
                        description: "Interactive Simulation Environment",
                        compilerEnabled: false,
                        ...getExperimentAcademicDetails(id),
                        algorithm: "1. Follow on-screen instructions.\n2. Observe output."
                    });
                    setError(null);
                };

                if (data && !data.error) {
                    setExperiment({
                        ...data,
                        ...getExperimentAcademicDetails(id)
                    });
                    setCode(data.codeTemplate || data.defaultCode || "");
                    setCurrentLanguage(data.language || "c");
                } else {
                    applyFallback();
                }
            } catch (err) {
                console.warn("[VLAB] Network Error fetching experiment, applying fallback for ID:", id);
                let fallbackTitle = "Experiment Simulation";
                if (id === 'cn-exp-1') fallbackTitle = 'OSI vs TCP/IP Reference Models';
                else if (id === 'cn-exp-2') fallbackTitle = 'CSMA/CD Protocol Simulation';
                else if (id === 'cn-exp-3') fallbackTitle = 'ARP Protocol Simulation';
                else if (id === 'cn-exp-4') fallbackTitle = 'Distance Vector Routing';
                else if (id === 'cn-exp-5') fallbackTitle = 'Selective Repeat Simulation';
                else if (id === 'cn-exp-6') fallbackTitle = 'Sliding Window Simulation';
                else if (id === 'cn-exp-7') fallbackTitle = 'Token Protocols Simulation';
                else if (id === 'dbms-exp-1') fallbackTitle = 'Introduction to DBMS';
                else if (id === 'dbms-exp-2') fallbackTitle = 'Application Development';
                else if (id === 'dbms-exp-3') fallbackTitle = 'Relational Algebra';
                else if (id === 'dbms-exp-4') fallbackTitle = 'Normalization';
                else if (id === 'dbms-exp-5') fallbackTitle = 'Host Language Integration';
                else if (id.startsWith('error-detection')) fallbackTitle = 'Error Detection Simulation';
                else if (id.startsWith('daa')) fallbackTitle = 'Algorithm Analysis';
                else if (id.startsWith('mpmc')) fallbackTitle = '8086 Simulator';
                else if (id.startsWith('dld')) fallbackTitle = 'Circuit Canvas';
                else if (id.startsWith('oops')) fallbackTitle = 'Java Compiler';
                
                setExperiment({
                    id,
                    title: fallbackTitle,
                    description: "Interactive Simulation Environment",
                    compilerEnabled: false,
                    ...getExperimentAcademicDetails(id),
                    algorithm: "1. Follow on-screen instructions.\n2. Observe output."
                });
                setError(null);
            } finally {
                setLoading(false);
            }
        };
        fetchExperiment();
    }, [id]);

    const handleRun = async () => {
        setIsRunning(true);
        setCompilerError(null);
        setOutput(null);
        setComplexityData(null);

        try {
            const res = await fetch(`${API_URL}/api/code/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language: currentLanguage.toLowerCase(), input: customInput })
            });

            const data = await res.json();
            if (res.ok) setOutput(data);
            else setCompilerError(data.error || "Execution failed");
        } catch (err) {
            setCompilerError("Network Error: Could not connect to compiler service.");
        } finally {
            setIsRunning(false);
        }
    };

    const handleAnalyzeComplexity = async () => {
        setIsRunning(true);
        setCompilerError(null);
        try {
            const inputs = [
                { label: "N=1,000", size: 1000, input: "1000" },
                { label: "N=10,000", size: 10000, input: "10000" },
                { label: "N=50,000", size: 50000, input: "50000" },
                { label: "N=100,000", size: 100000, input: "100000" }
            ];
            const res = await fetch(`${API_URL}/api/code/complexity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language: currentLanguage.toLowerCase(), inputs })
            });
            const data = await res.json();
            if (res.ok) setComplexityData(data);
            else setCompilerError(data.error || "Complexity analysis failed");
        } catch (err) {
            setCompilerError("Network Error: Could not connect to complexity service.");
        } finally {
            setIsRunning(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-transparent">
                <i className="bx bx-loader2 h-10 w-10 animate-spin text-primary mb-4" />
            </div>
        );
    }

    if (error || !experiment) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <i className="bx bx-info h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-foreground">Experiment Not Found</h1>
                <p className="text-muted-foreground max-w-md mb-8">The experiment you are looking for might have been moved or deleted.</p>
                <a href="/dashboard">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-xl font-bold uppercase tracking-widest text-xs">
                        Back to Dashboard
                    </Button>
                </a>
            </div>
        );
    }

    const isProgrammingLab = experiment.compilerEnabled === true || !!experiment.codeTemplate;

    if (isProgrammingLab) {
        return (
            <div className="hidden md:flex flex-col h-screen bg-background selection:bg-primary selection:text-primary-foreground overflow-hidden">
                <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4 z-50">
                    <div className="flex items-center gap-4">
                        <a href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                            <div className="p-1.5 rounded-lg group-hover:bg-accent">
                                <i className="bx bx-arrowleft h-3.5 w-3.5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                        </a>
                        <div className="h-3 w-[1px] bg-border" />
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary hover:bg-primary text-[9px] font-black tracking-widest px-1.5 py-0 text-primary-foreground">EXP {experiment.experimentNumber || "01"}</Badge>
                            <h1 className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[300px]">{experiment.title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full border border-border">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Auto-Saving Active</span>
                        </div>
                        <Badge variant="outline" className="border-primary/50 text-primary text-[9px] font-black uppercase px-2 py-0.5 rounded-full mr-2">Pro Lab Mode</Badge>

                        <Button
                            size="sm"
                            onClick={handleRun}
                            disabled={isRunning}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4 font-black text-[10px] uppercase tracking-widest rounded-lg"
                        >
                            {isRunning ? <i className="bx bx-loader2 h-3 w-3 animate-spin mr-2" /> : <i className="bx bx-play-circle h-3 w-3 mr-2" />}
                            {isRunning ? 'Compiling' : 'Run Experiment'}
                        </Button>
                    </div>
                </header>

                <div className="h-1 w-full bg-muted relative group cursor-help">
                    <div className="h-full bg-primary duration-1000 ease-in-out" style={{ width: isCompleted ? '100%' : '65%' }} />
                </div>

                <main className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col bg-[#1e1e1e] relative z-10 overflow-hidden border-x border-black/10">
                        <CodeCompiler
                            labId={experiment._id}
                            code={code}
                            setCode={setCode}
                            currentLanguage={currentLanguage}
                            setLanguage={setCurrentLanguage}
                            output={output}
                            setOutput={setOutput}
                            isRunning={isRunning}
                            setIsRunning={setIsRunning}
                            handleRun={handleRun}
                            error={compilerError}
                            setError={setCompilerError}
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                        />
                    </div>
                    <ExecutionInsights output={output} isRunning={isRunning} complexityData={complexityData} onAnalyzeComplexity={handleAnalyzeComplexity} />
                </main>
            </div>
        );
    }

    const simLabId = experiment.slug || experiment.id || experiment._id;
    const subjectName = getSubjectName(simLabId);

    const renderContent = () => {
        switch (activeSection) {
            case "aim":
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8">Aim</h2>
                        
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-2">Estimated Time</h3>
                            <p className="text-muted-foreground">1 hour</p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-bold mb-2">Learning Objective of the Experiment</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{experiment.aim || "To study and analyze the core concepts of this experiment."}</p>
                        </div>
                    </div>
                );
            case "theory":
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8">Theory</h2>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                            {experiment.theoryParagraphs && experiment.theoryParagraphs.length > 0 ? (
                                experiment.theoryParagraphs.map((p: string, idx: number) => (
                                    <p key={idx} className="leading-relaxed text-sm whitespace-pre-wrap">{p}</p>
                                ))
                            ) : (
                                <p className="leading-relaxed text-sm">{experiment.theory || "Theory content is currently being loaded."}</p>
                            )}
                        </div>
                    </div>
                );
            case "procedure":
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8">Procedure</h2>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                            {experiment.algorithm || "1. Read the theory carefully.\n2. Proceed to the simulation section.\n3. Interact with the simulation environment.\n4. Complete the posttest to evaluate your learning."}
                        </div>
                    </div>
                );
            case "simulation":
                if (!simulationStarted) {
                    return (
                        <div className="flex flex-col items-center min-h-full bg-background text-muted-foreground select-none overflow-y-auto pb-12 w-full">
                            <div className="w-full max-w-4xl mt-8">
                                <div className="bg-gradient-to-br from-[#021D24] to-[#059669] rounded-t-2xl p-8 text-white relative overflow-hidden shadow-lg">
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="bg-card/20 p-3 rounded-xl backdrop-blur-sm">
                                            <i className="bx bx-play-circle text-3xl text-white"></i>
                                        </div>
                                        <div>
                                            <p className="text-white/80 font-bold tracking-widest text-xs uppercase mb-1">{subjectName}</p>
                                            <h1 className="text-4xl font-bold text-white mb-3">{experiment.title}</h1>
                                            <p className="text-white/80 text-sm">Interactive Simulation Overview</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-card rounded-b-2xl shadow-none-none border border-border p-6 mb-6">
                                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Simulation Details</h2>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                        {experiment.description || "In this interactive simulation, you will be able to visualize and interact with the concepts discussed in the theory section. Follow the provided algorithm and observe the outcomes closely."}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSimulationStarted(true)}
                                    className="w-full mt-4 py-4 bg-primary hover:bg-primary text-white font-bold rounded-xl text-lg shadow-none-none active:scale-[0.98]"
                                >
                                    START SIMULATION
                                </button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex-1 flex flex-col h-full bg-background min-h-[600px] w-full">
                        <SimulationRenderer labId={simLabId} initialCode={experiment.codeTemplate} language={experiment.language} />
                    </div>
                );
            case "test":
                return (
                    <div className="flex-1 flex flex-col h-full">
                        <LabTest labId={simLabId} labTitle={experiment.title} />
                    </div>
                );
            case "references":
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8">References</h2>
                        <ul className="list-disc pl-5 space-y-3 text-muted-foreground text-sm font-medium">
                            {experiment.referencesList && experiment.referencesList.length > 0 ? (
                                experiment.referencesList.map((ref: string, idx: number) => (
                                    <li key={idx}>{ref}</li>
                                ))
                            ) : (
                                <li>Textbook and reference manuals will be populated here soon.</li>
                            )}
                        </ul>
                    </div>
                );
            default:
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8 capitalize">{activeSection}</h2>
                        <p className="text-muted-foreground italic">Content for {activeSection} is currently being updated for {experiment.title}.</p>
                    </div>
                );
        }
    };

    return (
        <div className="hidden md:flex flex-col h-screen bg-background overflow-hidden font-sans">
            {activeSection === "simulation" && simulationStarted ? (
                <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden relative">
                    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6 z-50 flex-shrink-0 shadow-sm font-sans">
                        {/* Left Section - Clean Brand Text format "Subject: Exp 0x Title" */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold tracking-tight text-foreground/90">
                                {subjectName}: Exp {experiment.experimentNumber || "01"} {experiment.title}
                            </span>
                        </div>

                        {/* Right Section - Zoom Icon controls (% size) and Icon Square Exit button */}
                        <div className="flex items-center gap-3">
                            {simLabId === "dld" && (
                                <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-2 py-1 rounded-xl text-xs font-bold text-foreground">
                                    <button
                                        onClick={() => {
                                            const zoomOutBtn = document.querySelector('.react-flow__controls-zoomout') as HTMLButtonElement;
                                            if (zoomOutBtn) zoomOutBtn.click();
                                            setZoomLevel(prev => Math.max(20, prev - 10));
                                        }}
                                        className="p-1 hover:bg-card rounded-lg transition-colors text-foreground text-sm font-bold flex items-center justify-center w-6 h-6"
                                        title="Zoom Out"
                                    >
                                        <i className="bx bx-minus" />
                                    </button>
                                    <span className="text-[11px] font-mono font-semibold px-1 text-muted-foreground w-10 text-center select-none">
                                        {zoomLevel}%
                                    </span>
                                    <button
                                        onClick={() => {
                                            const zoomInBtn = document.querySelector('.react-flow__controls-zoomin') as HTMLButtonElement;
                                            if (zoomInBtn) zoomInBtn.click();
                                            setZoomLevel(prev => Math.min(300, prev + 10));
                                        }}
                                        className="p-1 hover:bg-card rounded-lg transition-colors text-foreground text-sm font-bold flex items-center justify-center w-6 h-6"
                                        title="Zoom In"
                                    >
                                        <i className="bx bx-plus" />
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => setSimulationStarted(false)}
                                className="w-9 h-9 flex items-center justify-center text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-xl shadow-sm"
                                title="Exit Simulation"
                            >
                                <i className="bx bx-log-out text-lg" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
                        <SimulationRenderer labId={simLabId} initialCode={experiment.codeTemplate} language={experiment.language} />
                    </div>
                </div>
            ) : (
                <>
                    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 z-50 flex-shrink-0">
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <a href={`/dashboard/${simLabId.split('-')[0]}`} className="hover:text-primary transition-colors">{subjectName}</a>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-foreground font-semibold truncate max-w-[300px]">{experiment.title}</span>
                        </div>
                    </header>

                    <div className="flex flex-1 overflow-hidden">
                        <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0 overflow-y-auto">
                            <div className="py-4">
                                {SECTIONS.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-8 py-4 text-base font-semibold transition-colors ${
                                            activeSection === section.id 
                                                ? "text-primary border-l-4 border-primary bg-primary/10" 
                                                : "text-muted-foreground hover:bg-muted border-l-4 border-transparent hover:border-primary/30"
                                        }`}
                                    >
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <main className="flex-1 flex flex-col overflow-y-auto bg-background">
                            {/* Common Title Header for non-fullscreen tabs */}
                            {["simulation", "test"].includes(activeSection) ? null : (
                                <div className="w-full text-center py-8 bg-card border-b border-border">
                                    <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">{subjectName}</h1>
                                    <p className="text-muted-foreground font-semibold mt-2 text-lg">Experiment {experiment.experimentNumber || "01"} • {experiment.title}</p>
                                </div>
                            )}
                            
                            <div className="flex-1 flex flex-col">
                                {renderContent()}
                            </div>
                        </main>
                    </div>
                </>
            )}
        </div>
    );
}


export default function ExperimentPage({ id }: { id: string }) {
    return (
        <>
            <div className="flex md:hidden flex-col items-center justify-center h-screen bg-background p-6 text-center z-[9999] relative">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <i className="bx bx-laptop text-4xl text-primary"></i>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-3 text-foreground">Larger Screen Required</h1>
                <p className="text-muted-foreground text-sm max-w-[280px] mb-8">
                    Smaller device widths are not able to load experiment interfaces properly. Please open this page on a tablet or desktop.
                </p>
                <a href="/dashboard">
                    <Button className="bg-primary hover:bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs px-8 py-6 rounded-xl shadow-none">
                        Back to Dashboard
                    </Button>
                </a>
            </div>
            <div className="hidden md:block h-full w-full">
                <ExperimentPageContent id={id} />
            </div>
        </>
    );
}

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
import { ThemeToggle } from "@/components/ThemeToggle";

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

const SECTIONS = [
    { id: "aim", label: "Aim" },
    { id: "theory", label: "Theory" },
    { id: "simulation", label: "Simulation" },
    { id: "test", label: "Test" },
    { id: "references", label: "References" }
];


const getFallbackData = (id: string) => {
    let title = "Experiment Simulation";
    let aim = "To study and analyze the core concepts of this experiment.";
    let theory = "Detailed theory will be populated here.";
    
    // CN Experiments
    if (id === 'cn-exp-1') {
        title = 'OSI vs TCP/IP Reference Models';
        aim = 'To understand and compare the layers, protocols, and functionalities of the OSI and TCP/IP reference models.';
        theory = 'The Open Systems Interconnection (OSI) model is a conceptual framework used to comprehend and standardize the functions of a telecommunication or computing system. It divides the communication process into seven abstract layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. In contrast, the TCP/IP model is a more concise framework with four layers: Network Access, Internet, Transport, and Application. Both models serve as guidelines for designing network protocols and troubleshooting network issues.';
    } else if (id === 'cn-exp-2') {
        title = 'CSMA/CD Protocol Simulation';
        aim = 'To simulate the Carrier Sense Multiple Access with Collision Detection (CSMA/CD) protocol and observe network collision handling.';
        theory = 'CSMA/CD is a media access control method used in early Ethernet networks. "Carrier Sense" means a node listens to the channel before transmitting. If the channel is idle, it transmits; if busy, it waits. "Multiple Access" means multiple nodes share the same medium. "Collision Detection" means nodes monitor the medium while transmitting. If a collision is detected (i.e., multiple nodes transmit simultaneously), they stop, broadcast a jam signal, and wait for a random backoff period before attempting retransmission.';
    } else if (id === 'cn-exp-3') {
        title = 'ARP Protocol Simulation';
        aim = 'To understand how the Address Resolution Protocol (ARP) maps IP addresses to MAC addresses in a local network.';
        theory = 'ARP is a fundamental network protocol used to map a known logical address (IPv4) to an unknown physical hardware address (MAC address). When a device needs to communicate with another device on the same local network, it broadcasts an ARP Request asking "Who has this IP address?". The device with that IP address replies with an ARP Reply containing its MAC address. This mapping is then cached in the ARP table for future communications.';
    } else if (id === 'cn-exp-4') {
        title = 'Distance Vector Routing';
        aim = 'To simulate Distance Vector Routing protocols (like RIP) and observe how routing tables converge using the Bellman-Ford algorithm.';
        theory = 'Distance Vector Routing is an intra-domain routing protocol where each router maintains a table (vector) giving the best known distance to each destination and which link to use to get there. Routers periodically share their routing tables with their immediate neighbors. Using the Bellman-Ford algorithm, they update their tables to find the shortest path. While simple, it can suffer from the "count-to-infinity" problem, mitigated by techniques like split horizon and poison reverse.';
    } else if (id === 'cn-exp-5') {
        title = 'Selective Repeat Simulation';
        aim = 'To study the Selective Repeat ARQ protocol and how it handles packet loss by selectively retransmitting only the lost frames.';
        theory = 'Selective Repeat is an Automatic Repeat reQuest (ARQ) protocol used for reliable data transmission over unreliable networks. Unlike Go-Back-N, which retransmits all frames starting from the lost one, Selective Repeat only retransmits the specific frame that was lost or corrupted. Both the sender and receiver maintain a window of sequence numbers. The receiver buffers out-of-order frames and sends individual acknowledgments (ACKs) for each successfully received frame.';
    } else if (id === 'cn-exp-6') {
        title = 'Sliding Window Simulation';
        aim = 'To demonstrate flow control mechanisms using the Sliding Window protocol.';
        theory = 'The Sliding Window protocol is a flow control mechanism used in data link and transport layer protocols (like TCP) to ensure reliable and efficient data transmission. It allows the sender to transmit multiple frames before needing an acknowledgment (ACK). The "window" represents the maximum number of unacknowledged frames allowed. As ACKs are received, the window slides forward, allowing more frames to be sent, preventing the sender from overwhelming the receiver.';
    } else if (id === 'cn-exp-7') {
        title = 'Token Protocols Simulation';
        aim = 'To simulate Token Ring networks and understand deterministic media access control using tokens.';
        theory = 'Token Ring is a local area network (LAN) protocol in which all computers are connected in a ring or star topology and a bit- or token-passing scheme is used to prevent the collision of data between two computers that want to send messages at the same time. A special three-byte frame called a "token" circulates around the ring. A station must seize the token before it can transmit data, ensuring deterministic, collision-free access.';
    
    // DBMS
    } else if (id === 'dbms-exp-1') { title = 'Introduction to DBMS'; aim = 'To learn the fundamentals of Database Management Systems.'; theory = 'A Database Management System (DBMS) is software that interacts with end users, applications, and the database itself to capture and analyze the data...'; }
    else if (id === 'dbms-exp-2') { title = 'Application Development'; aim = 'To develop database applications using SQL.'; theory = 'Database application development involves creating front-end interfaces that interact with a backend SQL database...'; }
    else if (id === 'dbms-exp-3') { title = 'Relational Algebra'; aim = 'To study relational algebra operations.'; theory = 'Relational algebra is a procedural query language, which takes instances of relations as input and yields instances of relations as output...'; }
    else if (id === 'dbms-exp-4') { title = 'Normalization'; aim = 'To understand database normalization forms (1NF, 2NF, 3NF, BCNF).'; theory = 'Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity...'; }
    else if (id === 'dbms-exp-5') { title = 'Host Language Integration'; aim = 'To integrate SQL with a host programming language.'; theory = 'Host language integration allows SQL statements to be embedded within a procedural programming language like C or Java...'; }
    
    // Others
    else if (id.startsWith('error-detection')) { title = 'Error Detection Simulation'; aim = 'To study CRC and parity check methods.'; theory = 'Error detection techniques like Cyclic Redundancy Check (CRC) ensure data integrity over noisy channels...'; }
    else if (id.startsWith('daa')) { title = 'Algorithm Analysis'; aim = 'To analyze the time and space complexity of algorithms.'; theory = 'Algorithm analysis involves determining the computational complexity of an algorithm in terms of time (Big-O) and space...'; }
    else if (id.startsWith('mpmc')) { title = '8086 Simulator'; aim = 'To simulate 8086 microprocessor instructions.'; theory = 'The 8086 is a 16-bit microprocessor with a complex instruction set. Simulators allow testing assembly programs without hardware...'; }
    else if (id.startsWith('dld')) { title = 'Circuit Canvas'; aim = 'To design and simulate digital logic circuits.'; theory = 'Digital Logic Design involves creating circuits using basic logic gates (AND, OR, NOT) to perform boolean functions...'; }
    else if (id.startsWith('oops')) { title = 'Java Compiler'; aim = 'To practice Object-Oriented Programming concepts in Java.'; theory = 'Object-Oriented Programming (OOP) paradigms include encapsulation, inheritance, polymorphism, and abstraction...'; }
    
    return { title, aim, theory };
};

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
                    const { title, aim, theory } = getFallbackData(id);
                    setExperiment({
                        id,
                        title,
                        description: "Interactive Simulation Environment",
                        compilerEnabled: false,
                        theory,
                        aim,
                        algorithm: "1. Follow on-screen instructions.\n2. Observe output."
                    });
                    setError(null);
                };

                if (data && !data.error) {
                    setExperiment(data);
                    setCode(data.codeTemplate || data.defaultCode || "");
                    setCurrentLanguage(data.language || "c");
                } else {
                    applyFallback();
                }
            } catch (err) {
                console.warn("[VLAB] Network Error fetching experiment, applying fallback for ID:", id);
                const { title, aim, theory } = getFallbackData(id);
                setExperiment({
                    id,
                    title,
                    description: "Interactive Simulation Environment",
                    compilerEnabled: false,
                    theory,
                    aim,
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
                        <ThemeToggle />
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
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                            {experiment.theory || "Detailed theory will be populated here."}
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
                                <div className="bg-gradient-to-br from-[#021D24] to-[#059669] rounded-t-2xl p-8 text-white relative overflow-hidden">
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
                    <div className="h-10 bg-card border-b border-border flex items-center justify-between px-4 z-50 flex-shrink-0">
                        <button
                            onClick={() => setSimulationStarted(false)}
                            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-lg"
                        >
                            <i className="bx bx-arrow-back text-sm" />
                            <span>Exit Simulation / Back to Lab</span>
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="text-xs font-semibold text-muted-foreground truncate hidden sm:block">
                                {experiment.title} • Interactive Simulation Mode
                            </div>
                            <ThemeToggle />
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
                            <span className="hover:text-primary transition-colors cursor-pointer">{subjectName}</span>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-foreground font-semibold">Experiments</span>
                        </div>
                        <ThemeToggle />
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

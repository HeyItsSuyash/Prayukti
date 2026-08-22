"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PremiumNavbar } from "@/components/layout/PremiumNavbar";

import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";

interface Experiment {
    id: number | string;
    title: string;
    href: string;
    description?: string;
    pdfPath?: string;
    resourcesUrl?: string;
}

// Full Name Mapping
const SUBJECT_FULL_NAMES: Record<string, string> = {
    cn: "Computer Networks",
    dld: "Digital Logic and Design",
    dbms: "Database Management Systems",
    os: "Operating Systems",
    mpmc: "Microprocessors",
    oops: "OOPs",
    cd: "Compiler Design",
    "error-detection": "Error Detection",
    bee: "Basic Electrical Engg.",
    daa: "Data Structures & Algo"
};

// Fallback Data
const SUBJECT_EXPERIMENTS: Record<string, Experiment[]> = {
    cn: [
        { id: "cn-exp-1", title: "OSI vs TCP/IP Reference Models", href: "/dashboard/cn/cn-exp-1", description: "Study and compare the OSI and TCP/IP reference models through interactive simulation." },
        { id: "cn-exp-2", title: "CSMA/CD Protocol Simulation", href: "/dashboard/cn/cn-exp-2", description: "Simulate CSMA/CD protocol and understand collision detection in Ethernet networks." },
        { id: "cn-exp-3", title: "ARP Protocol Simulation", href: "/dashboard/cn/cn-exp-3", description: "Understand Address Resolution Protocol through interactive packet-level simulation." },
        { id: "cn-exp-4", title: "Distance Vector Routing", href: "/dashboard/cn/cn-exp-4", description: "Explore how routers exchange routing information using the Bellman-Ford algorithm." },
        { id: "cn-exp-5", title: "Selective Repeat ARQ", href: "/dashboard/cn/cn-exp-5", description: "Simulate Selective Repeat sliding window protocol for error control." },
        { id: "cn-exp-6", title: "Sliding Window Simulation", href: "/dashboard/cn/cn-exp-6", description: "Visualize flow control using sliding window protocols." },
        { id: "cn-exp-7", title: "Token Ring / FDDI Protocol", href: "/dashboard/cn/cn-exp-7", description: "Simulate Token Ring, Token Bus, and FDDI token-passing protocols." },
    ],
    dld: [
        { id: "dld-exp-1", title: "Study and Verification of Logic Gates", href: "/dashboard/dld/dld-exp-1", description: "Design and verify basic logic gates using digital ICs." },
        { id: "dld-exp-2", title: "Half Adder and Full Adder", href: "/dashboard/dld/dld-exp-2", description: "Construct and test half adder and full adder circuits." },
        { id: "dld-exp-3", title: "Half Subtractor and Full Subtractor", href: "/dashboard/dld/dld-exp-3", description: "Construct and test half subtractor and full subtractor circuits." },
        { id: "dld-exp-4", title: "Code Conversion (Binary to Gray)", href: "/dashboard/dld/dld-exp-4", description: "Implement binary to gray code conversion." },
        { id: "dld-exp-5", title: "Combinational Logic Design (SOP)", href: "/dashboard/dld/dld-exp-5", description: "Design combinational logic circuits for SOP expressions." },
        { id: "dld-exp-6", title: "Decoder and Encoder Circuits", href: "/dashboard/dld/dld-exp-6", description: "Design and verify decoders and encoders." },
        { id: "dld-exp-7", title: "Multiplexer and Demultiplexer", href: "/dashboard/dld/dld-exp-7", description: "Design and verify multiplexer and demultiplexer." },
        { id: "dld-exp-8", title: "Comparators (1-bit & 4-bit)", href: "/dashboard/dld/dld-exp-8", description: "Design 1-bit and 4-bit magnitude comparators." },
        { id: "dld-exp-9", title: "Flip-Flops", href: "/dashboard/dld/dld-exp-9", description: "Study and verify truth tables of various flip-flops." },
        { id: "dld-exp-10", title: "Synchronous and Asynchronous Counters", href: "/dashboard/dld/dld-exp-10", description: "Design and verify synchronous and asynchronous counters." },
    ],
    dbms: [
        { id: "dbms-exp-1", title: "Introduction to DBMS", href: "/dashboard/dbms/dbms-exp-1", description: "Introduction to database concepts, ACID properties, and basic SQL queries." },
        { id: "dbms-exp-2", title: "Application Development", href: "/dashboard/dbms/dbms-exp-2", description: "Build an E-R model and map it to a relational schema." },
        { id: "dbms-exp-3", title: "Relational Algebra", href: "/dashboard/dbms/dbms-exp-3", description: "Practice Relational Algebra operations and functional dependencies." },
        { id: "dbms-exp-4", title: "Normalization", href: "/dashboard/dbms/dbms-exp-4", description: "Apply normalization up to BCNF to reduce data redundancy." },
        { id: "dbms-exp-5", title: "Host Language Integration", href: "/dashboard/dbms/dbms-exp-5", description: "Embed SQL in C/Java programs using cursors and transactions." },
    ]
};

const getExperimentPdfAndResource = (subjectSlug: string, expId: string) => {
    const slug = subjectSlug.toLowerCase();
    const id = expId.toLowerCase();
    
    const pdfMap: Record<string, string> = {
        // DBMS
        "dbms-exp-1": "https://archive.nptel.ac.in/content/syllabus_pdf/106106093.pdf",
        "dbms-exp-2": "https://www.tutorialspoint.com/dbms/er_model_basic_concepts.htm",
        "dbms-exp-3": "https://www.cse.iitk.ac.in/users/atrem/courses/cs698f2017fall/lect2.pdf",
        "dbms-exp-4": "https://www.tutorialspoint.com/dbms/database_normalization.htm",
        "dbms-exp-5": "https://www.iitk.ac.in/LDP/HOWTO/pdf/Sybase-ASA-HOWTO.pdf",
        // DLD
        "dld-exp-1": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_logic_gates.htm",
        "dld-exp-2": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_adders.htm",
        "dld-exp-3": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_subtractors.htm",
        "dld-exp-4": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_code_converters.htm",
        "dld-exp-5": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_canonical_and_standard_forms.htm",
        "dld-exp-6": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_decoders.htm",
        "dld-exp-7": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_multiplexers.htm",
        "dld-exp-8": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_magnitude_comparator.htm",
        "dld-exp-9": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_flip_flops.htm",
        "dld-exp-10": "https://www.tutorialspoint.com/digital_circuits/digital_circuits_counters.htm",
        // CN
        "cn-exp-1": "https://www.tutorialspoint.com/data_communication_computer_network/tcp_ip_model.htm",
        "cn-exp-2": "https://www.tutorialspoint.com/carrier-sense-multiple-access-csma",
        "cn-exp-3": "https://www.tutorialspoint.com/address-resolution-protocol-arp",
        "cn-exp-4": "https://www.tutorialspoint.com/distance-vector-routing-algorithm",
        "cn-exp-5": "https://www.tutorialspoint.com/sliding-window-protocol-selective-repeat-arq",
        "cn-exp-6": "https://www.tutorialspoint.com/sliding-window-protocol-concepts-and-working",
        "cn-exp-7": "https://www.tutorialspoint.com/fiber-distributed-data-interface-fddi"
    };

    const resourceMap: Record<string, string> = {
        // DBMS
        "dbms-exp-1": "https://www.geeksforgeeks.org/dbms/introduction-of-dbms/",
        "dbms-exp-2": "https://www.geeksforgeeks.org/dbms/difference-between-entity-entity-set-and-entity-type/",
        "dbms-exp-3": "https://www.geeksforgeeks.org/dbms/basic-operators-in-relational-algebra-2/",
        "dbms-exp-4": "https://www.geeksforgeeks.org/dbms/types-of-normal-forms-in-dbms/",
        "dbms-exp-5": "https://en.wikipedia.org/wiki/Embedded_SQL",
        // DLD
        "dld-exp-1": "https://www.geeksforgeeks.org/digital-logic/logic-gates-in-digital-logic/",
        "dld-exp-2": "https://www.geeksforgeeks.org/digital-logic/half-adder-and-full-adder-circuit/",
        "dld-exp-3": "https://www.geeksforgeeks.org/digital-logic/half-subtractor-and-full-subtractor-circuits/",
        "dld-exp-4": "https://www.geeksforgeeks.org/digital-logic/gray-to-binary-and-binary-to-gray-conversion/",
        "dld-exp-5": "https://www.geeksforgeeks.org/digital-logic/sum-of-products-sop-form-in-digital-logic/",
        "dld-exp-6": "https://www.geeksforgeeks.org/digital-logic/encoder-in-digital-logic/",
        "dld-exp-7": "https://www.geeksforgeeks.org/digital-logic/multiplexers-in-digital-logic/",
        "dld-exp-8": "https://www.geeksforgeeks.org/digital-logic/magnitude-comparator-in-digital-logic/",
        "dld-exp-9": "https://www.geeksforgeeks.org/digital-logic/flip-flop-types/",
        "dld-exp-10": "https://www.geeksforgeeks.org/digital-logic/counters-in-digital-logic/",
        // CN
        "cn-exp-1": "https://www.geeksforgeeks.org/computer-network-tutorials/tcp-ip-model/",
        "cn-exp-2": "https://www.geeksforgeeks.org/computer-network-tutorials/collision-detection-in-csmacd/",
        "cn-exp-3": "https://www.geeksforgeeks.org/computer-network-tutorials/how-address-resolution-protocol-arp-works/",
        "cn-exp-4": "https://www.geeksforgeeks.org/computer-network-tutorials/distance-vector-routing-algorithm-routing-protocol/",
        "cn-exp-5": "https://www.geeksforgeeks.org/computer-network-tutorials/sliding-window-protocol-set-3-selective-repeat/",
        "cn-exp-6": "https://www.geeksforgeeks.org/computer-network-tutorials/sliding-window-protocol-set-1/",
        "cn-exp-7": "https://www.geeksforgeeks.org/computer-network-tutorials/token-ring-frame-format/"
    };

    const pdfPath = pdfMap[id] || `/docs/manuals/${slug}/${id}.pdf`;
    const resourcesUrl = resourceMap[id] || `https://www.geeksforgeeks.org/computer-science-tutorials/`;

    return { pdfPath, resourcesUrl };
};

export default function SubjectPage() {
    const params = useParams();
    const subjectSlug = Array.isArray(params.subject) ? params.subject[0] : params.subject;

    const [subject, setSubject] = useState<any>(null);
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [loading, setLoading] = useState(true);

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
                        setExperiments(expData.map((e: any) => {
                            const { pdfPath, resourcesUrl } = getExperimentPdfAndResource(subjectSlug, e.slug || e.id || e._id);
                            return {
                                id: e._id || e.id,
                                title: e.title,
                                href: `/dashboard/${subjectSlug}/${e.slug || e.id || e._id}`,
                                description: e.description,
                                pdfPath,
                                resourcesUrl
                            };
                        }));
                        return;
                    }
                }
                throw new Error("use fallback");
            } catch {
                const slug = subjectSlug?.toLowerCase() || "";
                const fallback = SUBJECT_EXPERIMENTS[slug] || SUBJECT_EXPERIMENTS["cn"];
                const enrichedFallback = fallback.map(e => {
                    const { pdfPath, resourcesUrl } = getExperimentPdfAndResource(slug, e.id as string);
                    return {
                        ...e,
                        pdfPath,
                        resourcesUrl
                    };
                });
                setExperiments(enrichedFallback);
            } finally {
                setLoading(false);
            }
        };
        if (subjectSlug) fetchData();
    }, [subjectSlug]);

    const resolvedTitle = subject?.title || SUBJECT_FULL_NAMES[subjectSlug?.toLowerCase() || ""] || subjectSlug?.toUpperCase() || "Subject";
    
    // Generate image based on title
    const getHeroImage = (slug: string) => {
        if (slug === 'cn') return '/cn-module.jpg.jpg';
        if (slug === 'dbms') return '/dbms-module.jpg.jpg';
        if (slug === 'dld') return '/dld-module.jpg.jpg';
        if (slug === 'oops') return '/oops-module.jpg.jpg';
        return '/cn-module.jpg.jpg'; // fallback
    };
    const bgImage = `url('${getHeroImage(subjectSlug?.toLowerCase() || "")}')`;

    return (
        <div className="h-screen flex flex-col bg-background font-sans overflow-hidden">
            <PremiumNavbar pathname={`/dashboard/${subjectSlug}`} />

            {/* Hero Section with BG Image */}
            <div className="flex-1 overflow-y-auto w-full">
            <div 
                className="text-white pt-32 pb-24 px-4 bg-cover bg-center relative"
                style={{ backgroundImage: bgImage }}
            >
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-[#021D24]/90"></div>
                
                <main className="container mx-auto max-w-7xl relative z-10 pl-8">
                    <a href="/dashboard" className="inline-flex items-center text-white/70 hover:text-white mb-6 text-sm font-medium transition-colors">
                        <i className="bx bx-left-arrow-alt text-xl mr-1"></i> Dashboard
                    </a>
                    
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mb-6">
                        {resolvedTitle}
                    </h1>
                    
                    <div className="max-w-3xl space-y-4">
                        <p className="text-white/80 text-lg">
                            {subject?.description || `Master the core concepts of ${resolvedTitle} through interactive and practical virtual simulations.`}
                        </p>
                        
                        <div>
                            <h3 className="text-[#059669] font-bold text-sm uppercase tracking-widest mb-1">Objectives</h3>
                            <p className="text-white/70 italic text-base">
                                To understand theoretical foundations and practical applications, develop problem-solving skills, and gain hands-on experience using industry-standard simulation tools.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-[#059669] font-bold text-sm uppercase tracking-widest mb-1">Faculty In-Charge</h3>
                            <p className="text-white/70 text-base font-medium">Prof. to be added soon</p>
                        </div>
                    </div>
                </main>
            </div>
            
            <main className="container mx-auto px-4 pt-12 pb-20 max-w-7xl">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <i className="bx bx-loader-alt bx-spin w-10 h-10 text-[#059669] text-4xl" />
                    </div>
                ) : experiments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-none border border-slate-300">
                        <h3 className="text-lg font-bold text-slate-500">No experiments found</h3>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 pl-4">
                        <h2 className="text-2xl font-bold text-foreground mb-4">List of Experiments</h2>
                        {experiments.map((exp, index) => (
                            <div key={exp.id} className="bg-white dark:bg-background border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center p-6 gap-6 rounded-xl">
                                
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[#059669] font-bold text-sm">
                                            {index + 1}.
                                        </span>
                                        <h3 className="text-lg font-bold text-foreground">
                                            {exp.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4 pl-5">
                                        {exp.description || "Master this concept through interactive simulation and real-time analysis."}
                                    </p>
                                    
                                    <div className="flex items-center gap-6 pl-5">
                                        <a 
                                            href={exp.pdfPath || "#"} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center gap-1.5 text-[#059669] hover:underline text-sm font-semibold"
                                        >
                                            <i className="bx bxs-file-pdf text-lg"></i> View PDF
                                        </a>
                                        <a 
                                            href={exp.resourcesUrl || "#"} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center gap-1.5 text-[#059669] hover:underline text-sm font-semibold"
                                        >
                                            <i className="bx bx-link-external text-lg"></i> Open Resources
                                        </a>
                                    </div>
                                </div>

                                <div className="shrink-0 w-full md:w-auto flex flex-col md:flex-row gap-3">
                                    <a href={exp.href}>
                                        <Button className="w-full md:w-auto px-6 bg-[#059669] hover:bg-[#059669] text-white rounded-xl h-11 font-semibold">
                                            View Experiment
                                        </Button>
                                    </a>
                                    <a href={`${exp.href}?test=true`} onClick={() => sessionStorage.setItem("openTab", "test")}>
                                        <Button variant="outline" className="w-full md:w-auto px-6 bg-transparent border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-transparent hover:text-slate-700 dark:hover:text-slate-300 rounded-xl h-11 font-semibold">
                                            Give Test
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            </div>
        </div>
    );
}

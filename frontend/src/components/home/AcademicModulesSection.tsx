"use client";



import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────
interface ModuleItem {
    id: string;
    title: string;
    number: string;
    href: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    icon: React.ReactNode;
    tag: string;
}

// ─── Module data ──────────────────────────────────────────────
const modules: ModuleItem[] = [
    {
        id: "cn",
        title: "Computer Networks",
        number: "01",
        href: "/dashboard/cn",
        description:
            "Simulate complex topologies, packet flows, and protocol behaviors including CSMA/CD and OSI Layer interactions.",
        imageSrc: "/cn-module.jpg.jpg",
        imageAlt: "Computer Networks",
        icon: <i className="bx bx-globe w-6 h-6"  />,
        tag: "Topology & Protocol",
    },
    {
        id: "dld",
        title: "Digital Logic Design",
        number: "02",
        href: "/dashboard/dld",
        description:
            "Build and test logic circuits, master flip-flops, and visualize gate-level operations with real-time waveform analysis.",
        imageSrc: "/dld-module.jpg.jpg",
        imageAlt: "Digital Logic & Design",
        icon: <i className="bx bx-binary w-6 h-6"  />,
        tag: "Circuit Simulation",
    },
    {
        id: "oops",
        title: "OOPs with C++ / Java",
        number: "03",
        href: "/dashboard/oops",
        description:
            "Visualize memory allocation, inheritance hierarchies, and polymorphism through interactive code simulation.",
        imageSrc: "/oops-module.jpg.jpg",
        imageAlt: "Object Oriented Programming",
        icon: <i className="bx bx-code2 w-6 h-6"  />,
        tag: "Code Logic",
    },
    {
        id: "dbms",
        title: "Database Systems",
        number: "04",
        href: "/dashboard/dbms",
        description:
            "Design schemas, normalize tables, and execute complex SQL queries in a high-fidelity visual database environment.",
        imageSrc: "/dbms-module.jpg.jpg",
        imageAlt: "Database Management System",
        icon: <i className="bx bx-database w-6 h-6"  />,
        tag: "Relational Design",
    },
];

// ─── Auth-aware navigate helper ───────────────────────────────
function useAuthNavigate() {
    
    return (labHref: string) => {
        const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('vlab_user');
        window.location.href = (isAuthenticated ? labHref : "/login");
    };
}

// ─── Individual Module Card ───────────────────────────────────
function ModuleCard({ mod, index }: { mod: ModuleItem, index: number }) {
    const navigate = useAuthNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 p-8 hover:border-accent transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-accent/5 flex flex-col h-full overflow-hidden cursor-pointer"
            onClick={() => navigate(mod.href)}
        >
            <div className="relative w-full h-48 mb-6 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                <img
                    src={mod.imageSrc}
                    alt={mod.imageAlt}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
            </div>

            {/* Background Number */}
            <span className="absolute top-4 right-8 text-8xl font-black text-slate-50 dark:text-slate-800/50 -z-0 select-none group-hover:text-accent/5 transition-colors">{mod.number}</span>
            
            <div className="relative z-10 flex-1 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
                    {mod.icon}
                </div>
                
                <div className="space-y-2">
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{mod.tag}</span>
                    <h3 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight group-hover:text-accent transition-colors">
                        {mod.title}
                    </h3>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {mod.description}
                </p>
            </div>

            <div className="relative z-10 mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between group/btn">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary dark:text-slate-400 group-hover:text-accent transition-colors">Launch Module</span>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-white group-hover:bg-accent group-hover:text-white group-hover:translate-x-1 transition-all">
                    <i className="bx bx-right-arrow-alt"  />
                </div>
            </div>
        </motion.div>
    );
}

// ─── Full Academic Modules Section ────────────────────────────
export function AcademicModulesSection() {
    return (
        <section className="py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
                    <div className="space-y-4">
                        <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] bg-accent/10 px-4 py-1.5 rounded-full inline-block">Curriculum Alignment</span>
                        <h2 className="text-5xl md:text-7xl font-black text-primary dark:text-white uppercase tracking-tighter leading-[0.9]">
                            Academic <br />
                            <span className="text-accent">Modules</span>
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md text-lg leading-relaxed border-l-4 border-accent pl-8">
                        Precision-engineered virtual laboratories designed strictly for the MMMUT Gorakhpur engineering syllabus.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                    {modules.map((mod, i) => (
                        <ModuleCard key={mod.id} mod={mod} index={i} />
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <a 
                        href="/explore"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary dark:text-slate-400 hover:text-accent transition-all group"
                    >
                        Explore All Subjects
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                            <i className="bx bx-right-arrow-alt"  />
                        </div>
                    </a>
                </div>
            </div>
        </section>
    );
}

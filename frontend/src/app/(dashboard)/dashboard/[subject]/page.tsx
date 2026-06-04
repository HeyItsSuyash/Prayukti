"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { ExperimentList } from "@/components/dashboard/ExperimentList";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";

export default function SubjectDashboardPage() {
    const params = useParams();
    const subjectSlug = params.subject as string;
    
    const [subject, setSubject] = useState<any>(null);
    const [experiments, setExperiments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch subject details and experiments
        // If API fails, we use fallback mock data so the UI doesn't break
        const fetchData = async () => {
            try {
                // In a real scenario, this would be an API call to get subject details
                // Mocking subject data based on the slug for now
                setSubject({
                    title: subjectSlug.toUpperCase(),
                    description: `Virtual Laboratory for ${subjectSlug.toUpperCase()}`,
                });

                // Try to fetch experiments
                const res = await fetch(`${API_URL}/api/experiments?subjectId=${subjectSlug}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setExperiments(data.map((exp: any) => ({
                            id: exp._id || exp.id,
                            title: exp.title,
                            difficulty: exp.difficulty || "Medium",
                            href: `/dashboard/${subjectSlug}/${exp._id || exp.id}`,
                            description: exp.description || "Master this concept through interactive simulation and real-time analysis.",
                            duration: "45 mins"
                        })));
                    } else {
                        throw new Error("No experiments found");
                    }
                } else {
                    throw new Error("Failed to fetch");
                }
            } catch (err) {
                // Fallback experiments if API fails or returns empty
                let fallbackData: any[] = [];
                if (subjectSlug === 'cn') {
                    fallbackData = [
                        { id: 'cn-exp-1', title: 'OSI vs TCP/IP Reference Models', difficulty: 'Easy', href: '/dashboard/cn/cn-exp-1', description: 'Study the encapsulation process and protocol suites.', duration: '30 mins' },
                        { id: 'cn-exp-2', title: 'CSMA/CD Protocol Simulation', difficulty: 'Medium', href: '/dashboard/cn/cn-exp-2', description: 'Carrier Sense Multiple Access with Collision Detection.', duration: '45 mins' },
                        { id: 'cn-exp-3', title: 'ARP Protocol Simulation', difficulty: 'Medium', href: '/dashboard/cn/cn-exp-3', description: 'Address Resolution Protocol simulation.', duration: '30 mins' },
                        { id: 'cn-exp-4', title: 'Distance Vector Routing', difficulty: 'Hard', href: '/dashboard/cn/cn-exp-4', description: 'DVR calculates the shortest path based on distance.', duration: '60 mins' },
                        { id: 'cn-exp-5', title: 'Selective Repeat Simulation', difficulty: 'Hard', href: '/dashboard/cn/cn-exp-5', description: 'Selective Repeat ARQ protocol.', duration: '60 mins' },
                        { id: 'cn-exp-6', title: 'Sliding Window Simulation', difficulty: 'Hard', href: '/dashboard/cn/cn-exp-6', description: 'Sliding window protocols.', duration: '60 mins' },
                        { id: 'cn-exp-7', title: 'Token Protocols Simulation', difficulty: 'Medium', href: '/dashboard/cn/cn-exp-7', description: 'Token ring access control.', duration: '45 mins' }
                    ];
                } else if (subjectSlug === 'dbms') {
                    fallbackData = [
                        { id: 'dbms-exp-1', title: 'Introduction to DBMS (DDL/DML)', difficulty: 'Easy', href: '/dashboard/dbms/dbms-exp-1', description: 'Learn SQL commands.', duration: '30 mins' },
                        { id: 'dbms-exp-2', title: 'Application Development', difficulty: 'Hard', href: '/dashboard/dbms/dbms-exp-2', description: 'Develop database-driven applications.', duration: '60 mins' },
                        { id: 'dbms-exp-3', title: 'Relational Algebra Operations', difficulty: 'Medium', href: '/dashboard/dbms/dbms-exp-3', description: 'Select, Project, Union, and Join operations.', duration: '45 mins' },
                        { id: 'dbms-exp-4', title: 'Normalization', difficulty: 'Hard', href: '/dashboard/dbms/dbms-exp-4', description: 'Normalize databases to 3NF/BCNF.', duration: '60 mins' },
                        { id: 'dbms-exp-5', title: 'Host Language Integration', difficulty: 'Medium', href: '/dashboard/dbms/dbms-exp-5', description: 'Interact with databases using PL/SQL.', duration: '45 mins' }
                    ];
                } else if (subjectSlug === 'error-detection') {
                    fallbackData = [
                        { id: 'error-detection-exp-1', title: 'CRC Simulation', difficulty: 'Medium', href: '/dashboard/error-detection/error-detection-exp-1', description: 'Cyclic Redundancy Check.', duration: '45 mins' },
                        { id: 'error-detection-exp-2', title: 'Checksum Simulation', difficulty: 'Medium', href: '/dashboard/error-detection/error-detection-exp-2', description: 'Checksum error detection.', duration: '30 mins' },
                        { id: 'error-detection-exp-3', title: 'Hamming Code Simulation', difficulty: 'Medium', href: '/dashboard/error-detection/error-detection-exp-3', description: 'Error correction codes.', duration: '45 mins' },
                        { id: 'error-detection-exp-4', title: 'Parity Check Simulation', difficulty: 'Easy', href: '/dashboard/error-detection/error-detection-exp-4', description: 'Even or Odd Parity.', duration: '30 mins' }
                    ];
                } else if (subjectSlug === 'daa') {
                    fallbackData = [{ id: 'daa-exp-1', title: 'Algorithm Analysis', difficulty: 'Medium', href: '/dashboard/daa/daa-exp-1', description: 'Analyze algorithm complexities.', duration: '60 mins' }];
                } else if (subjectSlug === 'mpmc') {
                    fallbackData = [{ id: 'mpmc-exp-1', title: '8086 Simulator Trainer Kit', difficulty: 'Hard', href: '/dashboard/mpmc/mpmc-exp-1', description: 'Simulate 8086 microprocessor instructions.', duration: '60 mins' }];
                } else if (subjectSlug === 'dld') {
                    fallbackData = [{ id: 'dld-exp-1', title: 'Circuit Canvas Simulator', difficulty: 'Medium', href: '/dashboard/dld/dld-exp-1', description: 'Simulate logic gates and circuits.', duration: '45 mins' }];
                } else if (subjectSlug === 'oops') {
                    fallbackData = [{ id: 'oops-exp-1', title: 'OOPS Java Compiler', difficulty: 'Medium', href: '/dashboard/oops/oops-exp-1', description: 'Write and compile Java code.', duration: '45 mins' }];
                } else {
                    fallbackData = [
                        { id: `${subjectSlug}-exp-1`, title: `Introduction to ${subjectSlug.toUpperCase()}`, difficulty: 'Easy', href: `/dashboard/${subjectSlug}/${subjectSlug}-exp-1`, description: 'Basic concepts.', duration: '30 mins' }
                    ];
                }
                setExperiments(fallbackData);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectSlug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
            <Navbar />
            
            <main className="container mx-auto px-4 pt-28 pb-20 max-w-7xl">
                <div className="mb-12 animate-in fade-in slide-in-from-left duration-500">
                    <Button 
                        variant="ghost" 
                        onClick={() => window.location.href = "/dashboard"}
                        className="flex items-center gap-2 mb-6 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Button>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-accent">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                                {subject?.title || subjectSlug.toUpperCase()} <span className="text-accent italic">Lab</span>
                            </h1>
                            <p className="text-slate-500 font-medium mt-2">
                                {subject?.description || `Explore and practice experiments for ${subjectSlug.toUpperCase()}.`}
                            </p>
                        </div>
                    </div>
                </div>

                <ExperimentList subject={subjectSlug} experiments={experiments} />
            </main>
            
            <Footer />
        </div>
    );
}

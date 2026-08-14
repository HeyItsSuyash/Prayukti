'use client';

import React, { useState } from 'react';
import { LabCard } from '@/components/ui/LabCard';

// Dummy data for labs matching the dashboard style
const allLabs = [
    { _id: "1", slug: "cn", title: "Computer Networks", description: "Simulate protocols, routing, and network behavior.", icon: "bx-globe" },
    { _id: "2", slug: "dld", title: "Digital Logic and Design", description: "Build and test digital circuits with interactive tools.", icon: "bx-chip" },
    { _id: "3", slug: "dbms", title: "Database Management Systems", description: "Explore database concepts with practical simulations.", icon: "bx-data" },
    { _id: "4", slug: "os", title: "Operating Systems", description: "Understand OS concepts through interactive labs.", icon: "bx-cog" },
    { _id: "5", slug: "mpmc", title: "Microprocessors", description: "Experience 8086 architecture with an in-built emulator.", icon: "bx-microchip" },
    { _id: "6", slug: "oops", title: "OOPs", description: "Compile and run code in multiple languages.", icon: "bx-cube-alt" },
    { _id: "7", slug: "cd", title: "Compiler Design", description: "Explore each phase of a compiler.", icon: "bx-terminal" },
    { _id: "8", slug: "error-detection", title: "Error Detection", description: "Learn hamming code, CRC, parity and more.", icon: "bx-check-shield" },
    { _id: "9", slug: "bee", title: "Basic Electrical Engg.", description: "Analyze circuits and electrical fundamentals.", icon: "bx-bolt-circle" },
    { _id: "10", slug: "daa", title: "Data Structures & Algo", description: "Visualize algorithms and solve problems step by step.", icon: "bx-code-alt" }
];

const getSubjectImage = (slug: string) => {
    if (slug === 'cn') return '/cn-module.jpg.jpg';
    if (slug === 'dbms') return '/dbms-module.jpg.jpg';
    if (slug === 'dld') return '/dld-module.jpg.jpg';
    if (slug === 'oops') return '/oops-module.jpg.jpg';
    return '/cn-module.jpg.jpg'; // fallback
};

const isComingSoon = (slug: string) => {
    return !['cn', 'dbms', 'dld', 'oops'].includes(slug);
};

export function LabsGrid() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // 4x2 grid

    const filteredLabs = allLabs.filter(lab => 
        lab.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lab.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLabs = filteredLabs.slice(startIndex, startIndex + itemsPerPage);

    return (
        <section className="pb-24 bg-background relative transition-colors pt-0">
            <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                
                {/* Overlapping Search Bar */}
                <div className="bg-card rounded-none shadow-md p-2 flex items-center mb-12 max-w-2xl mx-auto border border-border relative -translate-y-1/2">
                    <i className="bx bx-search text-2xl text-slate-400 dark:text-slate-500 ml-4 mr-2"></i>
                    <input 
                        type="text" 
                        placeholder="Search by experiment, lab, or subject."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to page 1 on search
                        }}
                        className="w-full bg-transparent border-none outline-none text-foreground p-3 text-lg"
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                    {currentLabs.map((lab) => (
                        <div key={lab._id} className="w-full h-full">
                            <LabCard
                                id={lab._id}
                                slug={lab.slug}
                                title={lab.title}
                                description={lab.description}
                                imageSrc={getSubjectImage(lab.slug)}
                                comingSoon={isComingSoon(lab.slug)}
                            />
                        </div>
                    ))}
                </div>

                {/* Pagination - Square corners */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-none transition-colors"
                        >
                            <i className="bx bx-chevron-left text-xl"></i>
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 flex items-center justify-center border font-semibold text-sm rounded-none transition-colors ${
                                    currentPage === i + 1 
                                    ? "bg-[#059669] text-white border-[#059669]" 
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-none transition-colors"
                        >
                            <i className="bx bx-chevron-right text-xl"></i>
                        </button>
                    </div>
                )}
                
                {filteredLabs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No labs found matching your search.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

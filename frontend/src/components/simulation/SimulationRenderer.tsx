"use client";

import React, { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Dynamic imports with React.lazy
const OSISimulation = lazy(() => import("@/components/simulation/cn/OSISimulation"));
const CSMASimulation = lazy(() => import("@/components/simulation/cn/CSMASimulation"));
const TokenProtocolsSimulation = lazy(() => import("@/components/simulation/cn/TokenProtocolsSimulation"));
const SlidingWindowSimulation = lazy(() => import("@/components/simulation/cn/SlidingWindowSimulation"));
const CircuitCanvas = lazy(() => import("@/components/simulation/dld/CircuitCanvas"));
const OOPSCompiler = lazy(() => import("@/components/simulation/oops/OOPSCompiler"));
const DAACompiler = lazy(() => import("@/components/simulation/daa/DAACompiler"));
const BasicOperationsSimulation = lazy(() => import("@/components/simulation/dbms/BasicOperationsSimulation"));
const ApplicationDevelopmentSimulation = lazy(() => import("@/components/simulation/dbms/ApplicationDevelopmentSimulation"));
const SQLQueriesSimulation = lazy(() => import("@/components/simulation/dbms/SQLQueriesSimulation"));
const NormalizationSimulation = lazy(() => import("@/components/simulation/dbms/NormalizationSimulation"));
const HostLanguageSimulation = lazy(() => import("@/components/simulation/dbms/HostLanguageSimulation"));
const MPMCSimulator = lazy(() => import("@/components/simulation/mpmc/MPMCSimulator"));
const CodeCompiler = lazy(() => import("@/components/simulation/core/CodeCompiler"));

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading Simulation...</span>
    </div>
);

// Map of registry IDs to Components
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    // CN
    "cn-exp-1": OSISimulation,
    "cn-exp-2": CSMASimulation,
    "cn-exp-3": TokenProtocolsSimulation,
    "cn-exp-4": SlidingWindowSimulation,

    // DLD
    "dld-exp-1": CircuitCanvas,
    "dld-exp-2": CircuitCanvas,
    "dld-exp-3": CircuitCanvas,
    "dld-exp-4": CircuitCanvas,
    "dld-exp-5": CircuitCanvas,
    "dld-exp-6": CircuitCanvas,
    "dld-exp-7": CircuitCanvas,
    "dld-exp-8": CircuitCanvas,
    "dld-exp-9": CircuitCanvas,
    "dld-exp-10": CircuitCanvas,

    // OOPS
    "oops-exp-1": OOPSCompiler,
    "oops-exp-2": OOPSCompiler,
    "oops-exp-3": OOPSCompiler,
    "oops-exp-4": OOPSCompiler,

    // DAA
    "daa-exp-1": DAACompiler,

    // DBMS
    "dbms-exp-1": BasicOperationsSimulation,
    "dbms-exp-2": ApplicationDevelopmentSimulation,
    "dbms-exp-3": SQLQueriesSimulation,
    "dbms-exp-4": NormalizationSimulation,
    "dbms-exp-5": HostLanguageSimulation,

    // MPMC
    "mpmc-exp-1": MPMCSimulator,
    "mpmc-exp-2": MPMCSimulator,
    "mpmc-exp-3": MPMCSimulator,
    "mpmc-exp-4": MPMCSimulator,
    "mpmc-exp-5": MPMCSimulator,
    "mpmc-exp-6": MPMCSimulator,
    "mpmc-exp-7": MPMCSimulator,
    "mpmc-exp-8": MPMCSimulator,

    // C Programming & DSA (Fallback to CodeCompiler for coding experiments)
    "c-exp-1": CodeCompiler,
    "c-exp-2": CodeCompiler,
    "c-exp-3": CodeCompiler,
    "dsa-exp-1": CodeCompiler,
    "dsa-exp-2": CodeCompiler,
    "dsa-exp-3": CodeCompiler,
};

export default function SimulationRenderer({ labId, initialCode, language }: {
    labId: string,
    initialCode?: string,
    language?: string
}) {
    let Component = COMPONENT_MAP[labId];

    // Fallback logic for arbitrary teacher inputs or missing mappings
    if (!Component) {
        const lowerId = labId.toLowerCase();
        if (lowerId.startsWith('cn')) Component = COMPONENT_MAP['cn-exp-1'];
        else if (lowerId.startsWith('oops')) Component = COMPONENT_MAP['oops-exp-1'];
        else if (lowerId.startsWith('dbms')) Component = COMPONENT_MAP['dbms-exp-1'];
        else if (lowerId.startsWith('mpmc')) Component = COMPONENT_MAP['mpmc-exp-1'];
        else if (lowerId.startsWith('c-') || lowerId.startsWith('dsa-')) Component = CodeCompiler;
        else Component = COMPONENT_MAP['dld-exp-1']; // Default to DLD circuit builder
    }

    if (!Component) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
                <p>Simulation component not found for ID: {labId}</p>
            </div>
        );
    }

    // Pass labId and practicalId for compatibility with various components
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Component labId={labId} practicalId={labId} initialCode={initialCode} language={language} />
        </Suspense>
    );
}

"use client";

import React, { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// CN
const OSISimulation = lazy(() => import("@/components/simulation/cn/OSISimulation"));
const CSMASimulation = lazy(() => import("@/components/simulation/cn/CSMASimulation"));
const TokenProtocolsSimulation = lazy(() => import("@/components/simulation/cn/TokenProtocolsSimulation"));
const SlidingWindowSimulation = lazy(() => import("@/components/simulation/cn/SlidingWindowSimulation"));
const ARPSimulation = lazy(() => import("@/components/simulation/cn/ARPSimulation"));
const DVRSimulation = lazy(() => import("@/components/simulation/cn/DVRSimulation"));
const SelectiveRepeatSimulation = lazy(() => import("@/components/simulation/cn/SelectiveRepeatSimulation"));

// DLD
const CircuitCanvas = lazy(() => import("@/components/simulation/dld/CircuitCanvas"));

// OOPS
const OOPSCompiler = lazy(() => import("@/components/simulation/oops/OOPSCompiler"));

// DAA
const DAACompiler = lazy(() => import("@/components/simulation/daa/DAACompiler"));

// DBMS
const BasicOperationsSimulation = lazy(() => import("@/components/simulation/dbms/BasicOperationsSimulation"));
const ApplicationDevelopmentSimulation = lazy(() => import("@/components/simulation/dbms/ApplicationDevelopmentSimulation"));
const SQLQueriesSimulation = lazy(() => import("@/components/simulation/dbms/SQLQueriesSimulation"));
const NormalizationSimulation = lazy(() => import("@/components/simulation/dbms/NormalizationSimulation"));
const HostLanguageSimulation = lazy(() => import("@/components/simulation/dbms/HostLanguageSimulation"));

// MPMC
const MPMCSimulator = lazy(() => import("@/components/simulation/mpmc/MPMCSimulator"));

// Error Detection
const CRC = lazy(() => import("@/components/simulation/error-detection/CRC"));
const Checksum = lazy(() => import("@/components/simulation/error-detection/Checksum"));
const HammingCode = lazy(() => import("@/components/simulation/error-detection/HammingCode"));
const ParityCheck = lazy(() => import("@/components/simulation/error-detection/ParityCheck"));

// Core
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
    "cn-exp-3": ARPSimulation,
    "cn-exp-4": DVRSimulation,
    "cn-exp-5": SelectiveRepeatSimulation,
    "cn-exp-6": SlidingWindowSimulation,
    "cn-exp-7": TokenProtocolsSimulation,

    // DBMS
    "dbms-exp-1": BasicOperationsSimulation,
    "dbms-exp-2": ApplicationDevelopmentSimulation,
    "dbms-exp-3": SQLQueriesSimulation,
    "dbms-exp-4": NormalizationSimulation,
    "dbms-exp-5": HostLanguageSimulation,

    // Phase 3
    "daa-exp-1": DAACompiler,
    "dld-exp-1": CircuitCanvas,
    "mpmc-exp-1": MPMCSimulator,
    "oops-exp-1": OOPSCompiler,
    "error-detection-exp-1": CRC,
    "error-detection-exp-2": Checksum,
    "error-detection-exp-3": HammingCode,
    "error-detection-exp-4": ParityCheck,

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
        else if (lowerId.startsWith('error')) Component = COMPONENT_MAP['error-detection-exp-1'];
        else if (lowerId.startsWith('c-') || lowerId.startsWith('dsa-') || lowerId.startsWith('daa-')) Component = CodeCompiler;
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

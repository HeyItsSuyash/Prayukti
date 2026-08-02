"use client";

import React, { lazy, Suspense } from "react";


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

// OS
const OSSimulator = lazy(() => import("@/components/simulation/os/OSSimulator"));

// PDS
const PDSSimulator = lazy(() => import("@/components/simulation/pds/PDSSimulator"));

// CD
const CompilerSimulator = lazy(() => import("@/components/simulation/cd/CompilerSimulator"));

// OT
const OptimizationSimulator = lazy(() => import("@/components/simulation/ot/OptimizationSimulator"));

// BEE
const BEESimulator = lazy(() => import("@/components/simulation/bee/BEESimulator"));

// DAA
const DAASimulator = lazy(() => import("@/components/simulation/daa/DAASimulator"));

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center p-8">
        <i className="bx bx-loader2 h-8 w-8 animate-spin text-primary"  />
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

    // Phase 3 / DLD / COA / MPMC / OOPS / Error Detection
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

    // OS Experiments
    "os-exp-1": OSSimulator,
    "os-exp-2": OSSimulator,
    "os-exp-3": OSSimulator,
    "os-exp-4": OSSimulator,
    "os-exp-5": OSSimulator,
    "os-exp-6": OSSimulator,
    "os-exp-7": OSSimulator,
    "os-exp-8": OSSimulator,
    "os-exp-9": OSSimulator,
    "os-exp-10": OSSimulator,
    "os-exp-11": OSSimulator,

    // PDS Experiments
    "pds-exp-1": PDSSimulator,
    "pds-exp-2": PDSSimulator,
    "pds-exp-3": PDSSimulator,
    "pds-exp-4": PDSSimulator,
    "pds-exp-5": PDSSimulator,
    "pds-exp-6": PDSSimulator,
    "pds-exp-7": PDSSimulator,
    "pds-exp-8": PDSSimulator,
    "pds-exp-9": PDSSimulator,
    "pds-exp-10": PDSSimulator,

    // Compiler Design Experiments
    "cd-exp-1": CompilerSimulator,
    "cd-exp-2": CompilerSimulator,
    "cd-exp-3": CompilerSimulator,
    "cd-exp-4": CompilerSimulator,
    "cd-exp-5": CompilerSimulator,
    "cd-exp-6": CompilerSimulator,
    "cd-exp-7": CompilerSimulator,

    // Optimization Techniques Experiments
    "ot-exp-1": OptimizationSimulator,
    "ot-exp-2": OptimizationSimulator,
    "ot-exp-3": OptimizationSimulator,
    "ot-exp-4": OptimizationSimulator,
    "ot-exp-5": OptimizationSimulator,
    "ot-exp-6": OptimizationSimulator,

    // Basic Electrical Engineering Experiments
    "bee-exp-1": BEESimulator,
    "bee-exp-2": BEESimulator,
    "bee-exp-3": BEESimulator,
    "bee-exp-4": BEESimulator,
    "bee-exp-5": BEESimulator,
    "bee-exp-6": BEESimulator,

    // COA Experiments (All mapped to CircuitCanvas logic/digital simulation)
    "coa-exp-1": CircuitCanvas,
    "coa-exp-2": CircuitCanvas,
    "coa-exp-3": CircuitCanvas,
    "coa-exp-4": CircuitCanvas,
    "coa-exp-5": CircuitCanvas,
    "coa-exp-6": CircuitCanvas,
    "coa-exp-7": CircuitCanvas,
    "coa-exp-8": CircuitCanvas,

    // DAA Experiments (daa-exp-1 uses compiler, others use visual simulator)
    "daa-exp-1": DAACompiler,
    "daa-exp-2": DAASimulator,
    "daa-exp-3": DAASimulator,
    "daa-exp-4": DAASimulator,
    "daa-exp-5": DAASimulator,
    "daa-exp-6": DAASimulator,
    "daa-exp-7": DAASimulator,
    "daa-exp-8": DAASimulator,
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
        else if (lowerId.startsWith('os')) Component = OSSimulator;
        else if (lowerId.startsWith('pds')) Component = PDSSimulator;
        else if (lowerId.startsWith('cd')) Component = CompilerSimulator;
        else if (lowerId.startsWith('ot')) Component = OptimizationSimulator;
        else if (lowerId.startsWith('bee')) Component = BEESimulator;
        else if (lowerId.startsWith('coa')) Component = CircuitCanvas;
        else if (lowerId.startsWith('daa')) Component = DAASimulator;
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

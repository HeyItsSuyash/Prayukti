import { Node, Edge } from '@xyflow/react';
import { evaluateCircuit } from './circuit-engine';

export interface TruthTableRow {
    inputs: Record<string, number>;
    outputs: Record<string, number>;
}

export interface SingleCircuitTableData {
    circuitId: string;
    circuitName: string;
    gateSummary: string;
    inputNames: string[];
    outputNames: string[];
    rows: TruthTableRow[];
    inputNodes: Node[];
    outputNodes: Node[];
}

export interface MultiCircuitAnalysis {
    circuits: SingleCircuitTableData[];
}

export type TableData = MultiCircuitAnalysis;

// Helper to decompose graph into connected components
function getConnectedComponents(nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] }[] {
    if (nodes.length === 0) return [];

    const adj = new Map<string, Set<string>>();
    nodes.forEach(n => adj.set(n.id, new Set()));

    edges.forEach(e => {
        if (adj.has(e.source) && adj.has(e.target)) {
            adj.get(e.source)!.add(e.target);
            adj.get(e.target)!.add(e.source);
        }
    });

    const visited = new Set<string>();
    const components: { nodes: Node[], edges: Edge[] }[] = [];

    nodes.forEach(node => {
        if (visited.has(node.id)) return;

        const componentNodeIds = new Set<string>();
        const queue = [node.id];
        visited.add(node.id);

        while (queue.length > 0) {
            const curr = queue.shift()!;
            componentNodeIds.add(curr);
            const neighbors = adj.get(curr);
            if (neighbors) {
                neighbors.forEach(neighbor => {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                });
            }
        }

        const compNodes = nodes.filter(n => componentNodeIds.has(n.id));
        const compEdges = edges.filter(e => componentNodeIds.has(e.source) && componentNodeIds.has(e.target));
        components.push({ nodes: compNodes, edges: compEdges });
    });

    return components;
}

export function generateTruthTable(nodes: Node[], edges: Edge[]): MultiCircuitAnalysis {
    const rawComponents = getConnectedComponents(nodes, edges);

    // Filter components to only those that have at least 1 input AND 1 output node
    const validComponents = rawComponents.filter(comp => {
        const hasInput = comp.nodes.some(n => n.type === 'inputNode');
        const hasOutput = comp.nodes.some(n => n.type === 'outputNode');
        return hasInput && hasOutput;
    });

    if (validComponents.length === 0) {
        return { circuits: [] };
    }

    const circuits: SingleCircuitTableData[] = validComponents.map((comp, idx) => {
        const inputNodes = comp.nodes
            .filter(n => n.type === 'inputNode')
            .sort((a, b) => (a.data.label as string || '').localeCompare(b.data.label as string || ''));

        const outputNodes = comp.nodes
            .filter(n => n.type === 'outputNode')
            .sort((a, b) => (a.data.label as string || '').localeCompare(b.data.label as string || ''));

        const inputNames = inputNodes.map(n => (n.data.label as string) || n.id);
        const outputNames = outputNodes.map(n => (n.data.label as string) || n.id);

        // Compute Gate Summary
        const gateCounts: Record<string, number> = {};
        comp.nodes.forEach(n => {
            if (n.type && n.type !== 'inputNode' && n.type !== 'outputNode') {
                const name = (n.data?.label as string) || n.type.toUpperCase();
                gateCounts[name] = (gateCounts[name] || 0) + 1;
            }
        });
        const gateSummary = Object.entries(gateCounts)
            .map(([gate, cnt]) => `${cnt}x ${gate}`)
            .join(', ') || 'Direct Connection';

        const rowCount = Math.pow(2, inputNodes.length);
        const rows: TruthTableRow[] = [];

        for (let i = 0; i < rowCount; i++) {
            const inputState = new Map<string, number>();
            inputNodes.forEach((node, index) => {
                const bit = (i >> (inputNodes.length - 1 - index)) & 1;
                inputState.set(node.id, bit);
            });

            const simNodes = comp.nodes.map(n => ({
                ...n,
                data: {
                    ...n.data,
                    value: inputState.has(n.id) ? inputState.get(n.id) : n.data.value
                }
            }));

            const evaluatedNodes = evaluateCircuit(simNodes, comp.edges);

            const rowInputs: Record<string, number> = {};
            const rowOutputs: Record<string, number> = {};

            inputNodes.forEach(n => {
                rowInputs[(n.data.label as string) || n.id] = inputState.get(n.id) as number;
            });

            outputNodes.forEach(n => {
                const finalNode = evaluatedNodes.find(en => en.id === n.id);
                rowOutputs[(n.data.label as string) || n.id] = (finalNode?.data?.value as number) || 0;
            });

            rows.push({ inputs: rowInputs, outputs: rowOutputs });
        }

        return {
            circuitId: `circuit-${idx + 1}`,
            circuitName: `Circuit ${idx + 1}`,
            gateSummary,
            inputNames,
            outputNames,
            rows,
            inputNodes,
            outputNodes
        };
    });

    return { circuits };
}

import { Connection, Node } from "@/generated/prisma";
import toposort from "toposort";
import { boolean } from "zod";
import { inngest } from "./client";

export const topologicalSort = (
    nodes: Node[],
    connections: Connection[]
): Node[] => {
    // if no connections, return nodes as is
    if (connections.length === 0) {
        return nodes;
    }

    // create edges for toposort
    const edges: [string, string][] = connections.map((conn) => [
        conn.fromNodeId,
        conn.toNodeId,
    ]);

    // add nodes without connections to edges to ensure they are included
    const connectedNodeIds = new Set<string>();
    for (const conn of connections) {
        connectedNodeIds.add(conn.fromNodeId);
        connectedNodeIds.add(conn.toNodeId);
    }

    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            edges.push([node.id, node.id]);
        }
    }

    // perform topological sort
    let sortedNodeIds: string[];
    try {
        sortedNodeIds = toposort(edges);
        // remove duplicates  from self edges
        sortedNodeIds = [...new Set(sortedNodeIds)];
    } catch (error) {
        if (error instanceof Error && error.message.includes("Cyclic")) {
            throw new Error("Workflow contains a cycle");
        }
        throw error;
    }

    // map sorted node IDs back to nodes objects
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(boolean);
}

export const sendWorkflowEcecution = async (data: {
    workflowId: string,
    [key: string]: any
}) => {
    return inngest.send({
        name: "workflows/execute.workflow",
        data
    })

}
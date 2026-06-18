'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';

// 1. Types for our API data
interface ApiResponseNode {
  id: string;
  title: string;
  node_type: string;
}

interface ApiResponseEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation: string;
}

export default function MapView() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 2. Fetch Nodes
      const nodesRes = await fetch('http://127.0.0.1:8000/nodes/');
      const nodesData: ApiResponseNode[] = await nodesRes.json();

      // 3. Fetch Edges (The New Endpoint)
      const edgesRes = await fetch('http://127.0.0.1:8000/edges/');
      const edgesData: ApiResponseEdge[] = await edgesRes.json();

      // 4. Convert Nodes for ReactFlow
      const flowNodes: Node[] = nodesData.map((node) => ({
        id: node.id,
        // Keep random positions for now, but consistent per node would require saving x/y to DB later
        position: { x: Math.random() * 500, y: Math.random() * 500 }, 
        data: { label: node.title },
        style: {
          background: '#1f2937',
          color: 'white',
          border: '1px solid #4b5563',
          width: 150,
        },
      }));

      // 5. Convert Edges for ReactFlow
      const flowEdges: Edge[] = edgesData.map((edge) => ({
        id: edge.id,
        source: edge.source_id,
        target: edge.target_id,
        animated: true, // Makes the line flow
        style: { stroke: '#4b5563' },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setLoading(false);
    }
    loadData();
  }, );

  // 6. Handle connecting nodes on the map
  const onConnect = useCallback(async (params: Connection) => {
    // Update UI immediately (Fast)
    setEdges((eds) => addEdge(params, eds));

    // Save to Database (Async)
    await fetch('http://127.0.0.1:8000/edges/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_id: params.source,
        target_id: params.target,
        relation: 'RELATED', // Default relation for manual map drawing
      }),
    });
  }, [setEdges]);

  if (loading) return <div className="text-white p-10">Loading Universe...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background color="#333" gap={16} />
      </ReactFlow>
    </div>
  );
}
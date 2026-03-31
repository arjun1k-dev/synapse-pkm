'use client';

import { useEffect, useState } from 'react';

// 1. Define the shape of the data coming from Python
interface Node {
  id: string;
  title: string;
  content: string | null;
  node_type: string;
  created_at: string;
}

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Fetch data from the Python Backend
    fetch('http://127.0.0.1:8000/nodes/')
      .then((res) => res.json())
      .then((data) => {
        setNodes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to connect to backend:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-white">Loading Synapse...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-blue-500">SYNAPSE</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <div key={node.id} className="border border-gray-700 bg-gray-900 p-4 rounded-lg hover:border-blue-500 transition-colors">
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{node.node_type}</div>
            <h2 className="text-xl font-bold mb-2">{node.title}</h2>
            <p className="text-gray-300 text-sm">{node.content || "No content"}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
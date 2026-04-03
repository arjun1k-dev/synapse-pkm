'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Node {
  id: string;
  title: string;
  content: string | null;
  node_type: string;
  created_at: string;
}

interface Edge {
  id:string;
  source_id: string;
  target_id: string;
  relation:string;
}

export default function Home() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Data
  useEffect(() => {
    async function fetchNodes() {
      const url = searchTerm 
        ? `http://127.0.0.1:8000/nodes/?q=${encodeURIComponent(searchTerm)}`
        : 'http://localhost:8000/nodes/';

      const res = await fetch(url);
      const data = await res.json();
      setNodes(data);
    }
    fetchNodes();
  }, [searchTerm]);

  // 2. Fetch Edges (for "Navigate to Root" logic)
  useEffect(() => {
    fetch('http://localhost:8000/edges/')
      .then(res => res.json())
      .then(data => setEdges(data));
  }, []);

  // 3. The Smart Navigation Logic
  const handleArrowClick = useCallback(async (e: React.MouseEvent, node: Node) => {
    e.stopPropagation(); // Prevent bubbling

    if (node.node_type === 'VIDEO') {
      // Extract URL from content (Format: "...\n\nLink: http://...")
      const urlMatch = node.content?.match(/Link:\s*(https?:\/\/[^\s]+)/);
      if (urlMatch && urlMatch[1]) {
        window.open(urlMatch[1], '_blank');
      } else {
        alert("No valid link found in this video node.");
      }
    } else {
      // Find the Parent Edge
      const parentEdge = edges.find(edge => edge.target_id === node.id && edge.relation === 'PARENT_OF');
      
      if (parentEdge) {
        // Navigate to the Parent
        router.push(`/subjects/${parentEdge.source_id}`);
      } else {
        // It's a Root Subject (or orphan), go to its own subject page
        if (node.node_type === 'SUBJECT') {
            router.push(`/subjects/${node.id}`);
        } else {
            alert("This node has no parent connection.");
        }
      }
    }
  }, [edges, router]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center pt-20 px-4">
      <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        SYNAPSE
      </h1>
      <p className="text-gray-400 mb-12 text-lg">Your Personal Knowledge Graph</p>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => window.location.href = '/create'}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]"
        >
          + Add Node
        </button>
        <button
          onClick={() => window.location.href = '/map'}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded font-bold transition-colors"
        >
          View Map
        </button>
        <button
          onClick={() => window.location.href = '/watchlist'}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded font-bold transition-colors"
        >
          Watchlist
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl mb-12 relative group">
        <input
          type="text"
          placeholder="Search your brain..."
          className="w-full bg-gray-900 border border-gray-700 text-white p-6 rounded-xl text-xl focus:outline-none focus:border-blue-500 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results Grid */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <div 
              key={node.id} 
              // REMOVED: onClick={() => router.push(...)}
              className="border border-gray-800 bg-gray-900/50 p-6 rounded-lg hover:bg-gray-800 transition-all hover:border-blue-500/50 relative group/card" // Added relative positioning
            >
              {/* TOP RIGHT: Edit Button */}
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/nodes/${node.id}/edit`);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-yellow-500 transition-colors text-xs font-bold uppercase tracking-wider z-10"
                title="Edit Node"
              >
                EDIT
              </button>

              <div className="flex items-center justify-between mb-3 pr-12"> {/* pr-12 pushes text away from Edit button */}
                <span className="text-xs font-bold text-blue-400 border border-blue-400/30 px-2 py-1 rounded">
                  {node.node_type}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{node.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-6">
                {node.content || "No content available."}
              </p>

              {/* BOTTOM RIGHT: Arrow Button */}
              <button
                onClick={(e) => handleArrowClick(e, node)}
                className="absolute bottom-4 right-4 text-gray-600 hover:text-white transition-colors"
                title="Navigate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
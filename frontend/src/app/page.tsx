'use client';

import { useEffect, useState } from 'react';

interface Node {
  id: string;
  title: string;
  content: string | null;
  node_type: string;
  created_at: string;
}

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/nodes/')
      .then((res) => res.json())
      .then((data) => {
        setNodes(data);
        setLoading(false);
      });
  }, []);

  // The Filter Logic
  const filteredNodes = nodes.filter((node) =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (node.content && node.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center pt-20 px-4">
      <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        SYNAPSE
      </h1>
      <p className="text-gray-400 mb-12 text-lg">Your Personal Knowledge Graph</p>

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
        {loading ? (
          <div className="text-center text-gray-500">Loading knowledge base...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNodes.map((node) => (
              <div 
                key={node.id} 
                className="border border-gray-800 bg-gray-900/50 p-6 rounded-lg hover:bg-gray-800 transition-all hover:border-blue-500/50 cursor-pointer backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-400 border border-blue-400/30 px-2 py-1 rounded">
                    {node.node_type}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{node.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3">
                  {node.content || "No content available."}
                </p>
              </div>
            ))}
            {filteredNodes.length === 0 && !loading && (
              <div className="col-span-full text-center text-gray-500 py-10">
                No nodes found matching "{searchTerm}".
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
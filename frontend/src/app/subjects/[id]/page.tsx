'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface Node {
  id: string;
  title: string;
  content: string | null;
  node_type: string;
}

interface Edge {
  source_id: string;
  target_id: string;
}

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [subject, setSubject] = useState<Node | null>(null);
  const [children, setChildren] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Get the Subject Details
        const subRes = await fetch(`http://127.0.0.1:8000/nodes/${id}`);
        if (!subRes.ok) throw new Error('Subject not found');
        const subData: Node = await subRes.json();
        setSubject(subData);

        // 2. Get the Connections (Children)
        const edgeRes = await fetch(`http://127.0.0.1:8000/nodes/${id}/connections`);
        const edgesData: Edge[] = await edgeRes.json();

        // 3. Fetch the actual Node data for each child
        const childPromises = edgesData.map(async (edge) => {
          const nodeRes = await fetch(`http://127.0.0.1:8000/nodes/${edge.target_id}`);
          return nodeRes.json();
        });

        const childrenData = await Promise.all(childPromises);
        setChildren(childrenData);
        
        setLoading(false);
      } catch (error) {
        console.error(error);
        router.push('/'); // Go home if error
      }
    }
    loadData();
  }, [id, router]);

  if (loading) return <div className="text-white p-10">Loading Subject...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Back to Search
            </button>
            <span className="text-gray-600">|</span>
            <span className="text-blue-400 font-bold uppercase tracking-wider">{subject?.node_type}</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">{subject?.title}</h1>
          <p className="text-gray-400 text-lg leading-relaxed">{subject?.content}</p>
        </div>

        {/* Children Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-300">Contained Topics ({children.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <div 
                key={child.id}
                onClick={() => router.push(`/subjects/${child.id}`)} // Navigate to child's page
                className="bg-gray-900 border border-gray-800 p-4 rounded hover:border-blue-500 cursor-pointer transition-all"
              >
                <div className="text-xs text-blue-400 mb-1 uppercase">{child.node_type}</div>
                <h3 className="text-xl font-bold">{child.title}</h3>
              </div>
            ))}
            {children.length === 0 && (
              <div className="text-gray-500 italic">No topics or notes connected yet.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

// 1. Define the shape of the data coming from Python
interface Node {
  id: string;
  title: string;
  content: string | null;
  node_type: string;
}

// 2. Component Props (params is a Promise in Next.js 16)
export default function EditNode({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  // 3. Unwrap the Promise to get the actual ID
  const { id } = use(params);

  // 4. State Variables
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nodeType, setNodeType] = useState('NOTE');
  const [loading, setLoading] = useState(true); // Loading existing data?
  const [saving, setSaving] = useState(false);  // Saving new changes?

  // 5. FETCH OLD DATA (The "Remember" Logic)
    useEffect(() => {
    async function fetchNodeData() {
      try {
        console.log("Fetching Node ID:", id); // Debug: Log the ID we are looking for

        const res = await fetch(`http://127.0.0.1:8000/nodes/${id}`);
        
        // NEW: Check if the response is actually okay
        if (!res.ok) {
          // Read the error message from Python
          const errorDetails = await res.text(); 
          console.error(`Server Error ${res.status}:`, errorDetails);
          throw new Error(`Server Error ${res.status}: ${errorDetails}`);
        }

        const data: Node = await res.json();

        // Populate State
        setTitle(data.title);
        setContent(data.content || '');
        setNodeType(data.node_type);
        
        setLoading(false);
      } catch (error) {
        console.error(error);
        // Alert the user with the specific details
        alert(`Could not load node.\nReason: ${error instanceof Error ? error.message : 'Unknown error'}`);
        router.push('/');
      }
    }

    fetchNodeData();
  }, [id, router]);

  // 7. HANDLE UPDATE (Save Changes)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/nodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          content: content,
          node_type: nodeType,
        }),
      });

      if (!res.ok) throw new Error('Failed to update node');

      // Success! Go back to home
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Error updating node. Please try again.');
      setSaving(false);
    }
  };

  // Show loading screen while fetching old data
  if (loading) return <div className="p-10 text-white">Loading Node Data...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-10 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-yellow-500">Edit Node</h1>
        
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <input
              type="text"
              required
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded focus:border-yellow-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
            <textarea
              rows={6}
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded focus:border-yellow-500 outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded outline-none"
              value={nodeType}
              onChange={(e) => setNodeType(e.target.value)}
            >
              <option value="SUBJECT">Subject (Root)</option>
              <option value="TOPIC">Topic</option>
              <option value="NOTE">Note</option>
              <option value="VIDEO">Video</option>
              <option value="SNIPPET">Code Snippet</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded border border-gray-600 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 rounded bg-yellow-600 hover:bg-yellow-700 font-bold text-black disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// 1. Interface for existing nodes (for Parent Dropdown)
interface Node {
  id: string;
  title: string;
  node_type: string;
}

export default function CreateNode() {
  const router = useRouter();

  // 2. State Variables
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nodeType, setNodeType] = useState('NOTE');
  const [parentId, setParentId] = useState<string>('');
  
  // NEW: State for Video URL and Preview
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [existingNodes, setExistingNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);

  // 3. Fetch existing nodes (for Parent selection)
  useEffect(() => {
    fetch('http://127.0.0.1:8000/nodes/')
      .then((res) => res.json())
      .then((data) => setExistingNodes(data));
  }, []);

  // 4. Handle Type Change (Toggle URL visibility)
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNodeType(e.target.value);
    // Clear URL fields if switching away from VIDEO
    if (e.target.value !== 'VIDEO') {
      setUrl('');
      setImageUrl('');
    }
  };

  // 5. Auto-Fetch Metadata (The "Magic" Logic)
  useEffect(() => {
    // Only fetch if type is VIDEO, there is a URL, and it looks like a link
    if (nodeType !== 'VIDEO' || !url) return;
    if (!url.startsWith('http')) return;

    // Debounce: Wait 1 second after user stops typing
    const timer = setTimeout(async () => {
      setLoadingPreview(true);
      try {
        const formData = new FormData();
        formData.append('url', url);

        const res = await fetch('http://127.0.0.1:8000/preview/', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        
        // Auto-fill title if user hasn't typed one yet
        if (!title) {
            setTitle(data.title);
        }
        // Set the image preview
        setImageUrl(data.image);
      } catch (err) {
        console.error("Failed to fetch preview", err);
      } finally {
        setLoadingPreview(false);
      }
    }, 1000); // 1000ms delay

    // Cleanup timer
    return () => clearTimeout(timer);
  }, [url, nodeType, title]);

  // 6. Handle Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepare Content: Append URL to content if it exists
    let finalContent = content;
    if (nodeType === 'VIDEO' && url) {
      finalContent = `${content}\n\nLink: ${url}`;
    }

    try {
      // Step A: Create the Node
      const nodeRes = await fetch('http://127.0.0.1:8000/nodes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          content: finalContent,
          node_type: nodeType,
        }),
      });
      
      if (!nodeRes.ok) throw new Error('Failed to create node');
      
      const newNode = await nodeRes.json();

      // Step B: If a parent was selected, Create the Edge
      if (parentId) {
        await fetch('http://127.0.0.1:8000/edges/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_id: parentId,
            target_id: newNode.id,
            relation: 'PARENT_OF',
          }),
        });
      }

      // Step C: Go back home
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Error creating node. Check console.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-10 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-blue-500">Add Knowledge</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Type Dropdown (Must be first to toggle URL box) */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded outline-none"
              value={nodeType}
              onChange={handleTypeChange}
            >
              <option value="SUBJECT">Subject (Root)</option>
              <option value="TOPIC">Topic</option>
              <option value="NOTE">Note</option>
              <option value="VIDEO">Video</option>
              <option value="SNIPPET">Snippet</option>
            </select>
          </div>

          {/* CONDITIONAL: URL Input (Only for VIDEO) */}
          {nodeType === 'VIDEO' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 border-l-2 border-red-500 pl-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Video URL</label>
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 p-3 rounded focus:border-red-500 outline-none"
                  placeholder="Paste YouTube link here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                {loadingPreview && <div className="text-xs text-blue-400 mt-1">Fetching metadata...</div>}
              </div>

              {/* Thumbnail Preview */}
              {imageUrl && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Detected Thumbnail:</p>
                  <img src={imageUrl} alt="Preview" className="w-82 h-48 rounded border border-gray-700" />
                </div>
              )}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <input
              type="text"
              required
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded focus:border-blue-500 outline-none"
              placeholder="e.g., Calculus II"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
            <textarea
              required
              rows={6}
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded focus:border-blue-500 outline-none"
              placeholder="What is this about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Parent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Parent (Optional)</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded outline-none"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">-- No Parent --</option>
              {existingNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.title} ({node.node_type})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded border border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded bg-blue-600 hover:bg-blue-700 font-bold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save to Synapse'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Node {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  node_type: string;
}

export default function Watchlist() {
  const router = useRouter();
  const [videos, setVideos] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('http://127.0.0.1:8000/nodes/');
        const data: Node[] = await res.json();
        
        // Filter only VIDEO nodes
        const videoNodes = data.filter((node) => node.node_type === 'VIDEO');
        setVideos(videoNodes);
      } catch (error) {
        console.error("Failed to load watchlist", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  // Helper: Extract YouTube ID and Thumbnail URL
  const getVideoData = (content: string | null) => {
    if (!content) return { thumb: '', id: '', url: '' };
    
    // Regex to find YouTube Link and ID
    const urlMatch = content.match(/Link:\s*(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : '';
    
    if (!url) return { thumb: '', id: '', url: '' };

    let videoId = '';
    
    // Extract ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      videoId = match[2];
      // High quality thumbnail
      const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; 
      return { thumb, id: videoId, url };
    }

    return { thumb: '', id: '', url };
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl font-bold mb-1">Watchlist</h1>
        <p className="text-gray-400 text-sm">Your saved videos and tutorials</p>
      </div>

      {/* YouTube-Style Grid */}
      {loading ? (
        <div className="text-center text-gray-500">Loading videos...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {videos.map((video) => {
            const { thumb, url } = getVideoData(video.content);

            return (
              <div key={video.id} className="group cursor-pointer flex flex-col gap-3">
                
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group-hover:border-red-600 transition-colors">
                  
                  {thumb ? (
                    <>
                      <img 
                        src={thumb} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onClick={() => url && window.open(url, '_blank')}
                      />
                      {/* Play Icon Overlay */}
                      <div 
                        onClick={() => url && window.open(url, '_blank')}
                        className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center"
                      >
                        <div className="w-10 h-10 bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Thumbnail
                    </div>
                  )}

                  {/* Edit Button (Top Right) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/nodes/${video.id}/edit`);
                    }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-blue-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                </div>

                {/* Meta Data */}
                <div className="flex gap-3 px-1">
                    {/* Avatar Placeholder */}
                    <div className="w-9 h-9 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                        {video.title.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex flex-col">
                        <h3 
                            onClick={() => url && window.open(url, '_blank')}
                            className="text-white font-semibold text-sm leading-5 line-clamp-2 group-hover:text-blue-400 transition-colors"
                        >
                            {video.title}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                            Saved to Synapse
                        </p>
                        <p className="text-gray-500 text-xs">
                            {new Date(video.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

              </div>
            );
          })}

          {videos.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-20">
              No videos saved yet. Go add some!
            </div>
          )}
        </div>
      )}
    </main>
  );
}
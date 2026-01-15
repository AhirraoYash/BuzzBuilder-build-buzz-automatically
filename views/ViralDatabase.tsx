import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, ThumbsUp } from 'lucide-react';
import LinkedInPostPreview from '../components/LinkedInPostPreview';

const ViralDatabase: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/database');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch database", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-500" />
            Viral Training Data
          </h2>
          <p className="text-gray-400 mt-2">
            The AI learns from these {posts.length} high-performing posts stored in your MongoDB.
          </p>
        </div>
        <button 
          onClick={fetchPosts}
          className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors border border-gray-700"
        >
          <RefreshCw className={`h-5 w-5 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading Viral Database...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div key={post._id} className="relative group">
              {/* The Post Preview Card */}
              <LinkedInPostPreview content={post.content} />
              
              {/* Overlay Badge for Likes */}
              <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-md border border-green-500/50 text-green-400 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-10">
                <ThumbsUp className="h-3 w-3" />
                {post.likes > 1000 ? (post.likes / 1000).toFixed(1) + 'k' : post.likes} Likes
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViralDatabase;
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  ArrowUpDown,
  ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface GeneratedPost {
  _id: string;
  topic: string;
  platform: string;
  content: string;
  image_url?: string; // Added image support
  timestamp: string; 
}

// --- Card Component ---

const HistoryCard: React.FC<{ 
  post: GeneratedPost; 
  onDelete: (id: string) => void 
}> = ({ post, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    await onDelete(post._id);
    setIsDeleting(false);
  };

  const dateStr = new Date(post.timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-blue-900/10"
    >
      {/* 1. Image Section (Visible now!) */}
      <div className="h-40 bg-zinc-800 w-full relative overflow-hidden">
        {post.image_url ? (
          <img 
            src={post.image_url} 
            alt="Generated Content" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
            // Placeholder Gradient if no image exists
          <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40 flex items-center justify-center">
            <div className="text-center">
                <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <span className="text-xs text-white/30 uppercase tracking-widest">Text Only</span>
            </div>
          </div>
        )}
        
        {/* Platform Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-white/10">
          {post.platform || "LinkedIn"}
        </div>

        {/* Action Buttons (Overlay) */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0">
             <button onClick={handleCopy} className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-blue-600 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
             </button>
             <button onClick={handleDelete} className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-red-600 transition-colors">
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
             </button>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
            {post.topic || "Untitled Idea"}
        </h3>
        
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4 mb-4 flex-grow font-light">
            {post.content}
        </p>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {dateStr}
            </div>
            <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                AI Generated
            </span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page ---

const GeneratedHistory: React.FC = () => {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- SORTING STATE ---
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/history');
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError("Is Backend Running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDeletePost = async (id: string) => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/history/${id}`, { method: 'DELETE' });
        if (res.ok) setPosts(prev => prev.filter(p => p._id !== id));
    } catch (e) { alert("Connection Error"); }
  };

  // --- SORTING LOGIC ---
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [posts, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 h-full flex flex-col">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-8 pb-6 border-b border-white/5 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">
                Content Vault
            </h1>
            <p className="text-zinc-400 mt-1">
                Manage your generated posts.
            </p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* SORT BUTTON */}
            <button 
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium border border-white/5"
            >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
            
            <div className="text-right hidden sm:block">
                <p className="text-2xl font-bold text-white">{posts.length}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Posts</p>
            </div>
        </div>
      </header>

      {/* Grid */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        ) : error ? (
            <div className="text-center text-red-400 py-10">{error}</div>
        ) : sortedPosts.length === 0 ? (
            <div className="text-center text-zinc-500 py-20">No posts found.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                <AnimatePresence mode='popLayout'>
                    {sortedPosts.map((post) => (
                        <HistoryCard 
                            key={post._id} 
                            post={post} 
                            onDelete={handleDeletePost} 
                        />
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedHistory;
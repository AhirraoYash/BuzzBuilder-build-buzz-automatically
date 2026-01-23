import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Loader2, 
  ArrowUpDown,
  ImageIcon,
  X,
  Maximize2,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface GeneratedPost {
  _id: string;
  topic: string;
  platform: string;
  content: string;
  image_url?: string;
  timestamp: string; 
}

// --- 1. THE POPUP MODAL (New Component) ---
const PostDetailModal: React.FC<{ 
    post: GeneratedPost; 
    onClose: () => void;
    onDelete: (id: string) => void;
}> = ({ post, onClose, onDelete }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(post.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        if (confirm("Delete this post permanently?")) {
            onDelete(post._id);
            onClose(); // Close modal after delete
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop (Darken background) */}
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]"
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* LEFT SIDE: Image (Full Height) */}
                <div className="w-full md:w-1/2 bg-zinc-950 flex items-center justify-center relative min-h-[300px] md:min-h-full">
                    {post.image_url ? (
                        <img 
                            src={post.image_url} 
                            alt="Post Visual" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-white/20">
                            <ImageIcon className="w-16 h-16 mb-4" />
                            <p className="uppercase tracking-widest text-sm">No Image Generated</p>
                        </div>
                    )}
                    
                    {/* Platform Badge Overlay */}
                    <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <Share2 className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-bold text-white uppercase">{post.platform}</span>
                    </div>
                </div>

                {/* RIGHT SIDE: Content (Scrollable) */}
                <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 bg-zinc-900">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-tight">
                                {post.topic || "Untitled Post"}
                            </h2>
                            <p className="text-white/40 text-sm mt-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.timestamp).toLocaleDateString(undefined, { dateStyle: 'full' })}
                            </p>
                        </div>
                    </div>

                    {/* Scrollable Text Area */}
                    <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar mb-6">
                        <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap font-light">
                            {post.content}
                        </p>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-6 border-t border-white/10 flex gap-3 mt-auto">
                        <button 
                            onClick={handleCopy}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Text"}
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="px-4 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-white/60 hover:text-red-400 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- 2. THE CARD COMPONENT (Compact Preview) ---
const HistoryCard: React.FC<{ 
  post: GeneratedPost; 
  onClick: (post: GeneratedPost) => void;
}> = ({ post, onClick }) => {
  
  const dateStr = new Date(post.timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onClick={() => onClick(post)} // Open Modal on Click
      className="group cursor-pointer bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-blue-900/10 relative"
    >
      {/* Image Preview */}
      <div className="h-48 bg-zinc-800 w-full relative overflow-hidden">
        {post.image_url ? (
          <img 
            src={post.image_url} 
            alt="Preview" 
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white/10" />
          </div>
        )}
        
        {/* Hover Overlay Icon */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white">
                <Maximize2 className="w-5 h-5" />
            </div>
        </div>

        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-white/10">
          {post.platform || "LinkedIn"}
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {post.topic || "Untitled Idea"}
        </h3>
        
        {/* Clamp text to 3 lines for a neat grid */}
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow font-light">
            {post.content}
        </p>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {dateStr}
            </div>
            <span className="text-blue-500/60 group-hover:text-blue-400 transition-colors">
                Click to view
            </span>
        </div>
      </div>
    </motion.div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---

const GeneratedHistory: React.FC = () => {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null); // State for Modal
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

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [posts, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 h-full flex flex-col relative">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-8 pb-6 border-b border-white/5 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Content Vault</h1>
            <p className="text-zinc-400 mt-1">Manage your generated posts.</p>
        </div>
        <div className="flex items-center gap-4">
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

      {/* GRID */}
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
                            onClick={setSelectedPost} // Pass the click handler
                        />
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>

      {/* MODAL (Rendered outside the loop) */}
      <AnimatePresence>
        {selectedPost && (
            <PostDetailModal 
                post={selectedPost} 
                onClose={() => setSelectedPost(null)}
                onDelete={handleDeletePost}
            />
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default GeneratedHistory;    
import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, TrendingUp, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// --- 1. Sub-Components for the Real Data ---

const ViralityBadge: React.FC<{ score: number }> = ({ score }) => {
  const isHigh = score > 80;
  const color = isHigh ? 'green' : 'yellow';
  // Note: Tailwind dynamic classes like `bg-${color}-500` sometimes fail if not safelisted.
  // Using explicit classes is safer.
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
      isHigh 
        ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    }`}>
      <TrendingUp className="h-3.5 w-3.5" />
      <span>{score}/100 Viral</span>
    </div>
  );
};

const PostCard: React.FC<{ post: any }> = ({ post }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900 border border-white/10 rounded-xl p-5 transition-all hover:border-blue-500/30 group"
  >
    <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
            {/* Initials Avatar (Since we don't scrape images yet) */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
                {post.author ? post.author[0].toUpperCase() : "?"}
            </div>
            <div>
                <p className="font-semibold text-white">{post.author || "Unknown User"}</p>
                <p className="text-xs text-white/50">LinkedIn Creator</p>
            </div>
        </div>
        <ViralityBadge score={post.viralityScore} />
    </div>
    
    <p className="text-sm text-white/80 mb-4 leading-relaxed whitespace-pre-wrap">
        {post.content}
    </p>
    
    <div className="flex items-center gap-4 text-xs text-white/50 border-t border-white/5 pt-4 mt-2">
      <div className="flex items-center gap-1.5 text-blue-400">
          <ThumbsUp className="h-4 w-4" /> {post.likes}
      </div>
      <div className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" /> High Engagement
      </div>
    </div>
  </motion.div>
);

// --- 2. Main Component ---

const TrendAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (overrideQuery?: string) => {
    const searchTerm = overrideQuery || query;
    if (!searchTerm) return;
    
    // Update UI state
    if (overrideQuery) setQuery(overrideQuery);
    setIsLoading(true);
    setHasSearched(true);
    setPosts([]); // Clear previous results

    try {
      // 🚀 CALL THE PYTHON BACKEND
      const response = await fetch(`http://127.0.0.1:8000/analyze?hashtag=${searchTerm}`);
      const data = await response.json();

      if (data.status === "success") {
        setPosts(data.posts);
      } else {
        console.error("Scraper failed:", data);
        alert("Scraping failed! Check your Python terminal for errors.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to Python backend. Is it running?");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Market Intelligence
        </h1>
        <p className="text-white/60 mt-2">
            Discover what's trending and going viral in your niche.
        </p>
      </header>

      {/* Search Input */}
      <div className="relative w-full mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-5 w-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search Hashtag (e.g. saas, coding, ai)..."
          className="w-full bg-zinc-900 border border-white/10 rounded-full py-3 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-zinc-500"
        />
        <button 
            onClick={() => handleSearch()}
            disabled={isLoading || !query}
            className="absolute right-2 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Analyze'}
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-grow pb-10">
        {!hasSearched ? (
          <div className="text-center mt-12">
            <h2 className="text-lg font-semibold mb-4 text-white/80">Trending Now</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {['AI', 'SaaS', 'Coding', 'Marketing', 'Startup'].map((tag) => (
                <button 
                    key={tag} 
                    onClick={() => handleSearch(tag)} 
                    className="bg-zinc-800 border border-white/5 text-white/70 px-4 py-2 rounded-full text-sm hover:bg-zinc-700 hover:text-white hover:border-white/20 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoading && posts.length === 0 && (
                <div className="text-center py-20 text-white/50 flex flex-col items-center animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                    <p>Scanning LinkedIn for viral posts...</p>
                    <p className="text-xs mt-2 text-white/30">(Watch the Chrome window!)</p>
                </div>
            )}

            {posts.map((post, index) => (
              <PostCard key={index} post={post} />
            ))}

            {!isLoading && posts.length === 0 && (
                <div className="text-center py-10 text-white/40">
                    No viral posts found for this hashtag. Try a broader term.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendAnalyzer;
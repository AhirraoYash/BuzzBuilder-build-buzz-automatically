import React, { useEffect, useState } from 'react';
import { Database, Play, ChevronDown, ChevronUp, Calendar, Loader2 } from 'lucide-react';
import LinkedInPostPreview from '../components/LinkedInPostPreview';

interface Session {
  label: string;
  count: number;
  timestamp: number;
  avg_likes: number;
}

const ViralDatabase: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [sessionPosts, setSessionPosts] = useState<any[]>([]);
  
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [scraping, setScraping] = useState(false);

  // 1. Load the list of batches (Sessions)
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch('http://localhost:8000/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingSessions(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // 2. Trigger the Scraper
  const handleStartScrape = async () => {
    setScraping(true);
    try {
      await fetch('http://localhost:8000/trigger-scrape', { method: 'POST' });
      alert("🚀 Scraper Started! \n\nA Chrome window will open on your computer.\nPlease log in and press ENTER in the terminal if asked.");
    } catch (err) {
      alert("Failed to start scraper.");
    }
    // We don't turn off 'scraping' immediately because it runs in background
    setTimeout(() => setScraping(false), 5000); 
  };

  // 3. Load posts when a user clicks a session
  const toggleSession = async (timestamp: number) => {
    if (expandedSession === timestamp) {
      setExpandedSession(null); // Close if already open
      return;
    }

    setExpandedSession(timestamp);
    setLoadingPosts(true);
    try {
      const res = await fetch(`http://localhost:8000/posts-by-session?timestamp=${timestamp}`);
      const data = await res.json();
      setSessionPosts(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingPosts(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#161b22] p-6 rounded-xl border border-white/10 shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-500" />
            Viral Training Data
          </h2>
          <p className="text-gray-400 mt-2">
            Organized by Scraping Sessions. Click a batch to view posts.
          </p>
        </div>

        <button 
          onClick={handleStartScrape}
          disabled={scraping}
          className={`mt-4 md:mt-0 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
            scraping 
            ? 'bg-orange-600/50 cursor-wait text-orange-200' 
            : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
          }`}
        >
          {scraping ? <Loader2 className="animate-spin h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
          {scraping ? "Scraper Running..." : "Start New Scrape"}
        </button>
      </div>

      {/* SESSIONS LIST */}
      <div className="space-y-4">
        {loadingSessions ? (
          <div className="text-center py-10 text-gray-500">Loading history...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-[#161b22] rounded-lg">
            No data found. Click "Start New Scrape" to begin!
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.timestamp} className="bg-[#161b22] border border-white/10 rounded-lg overflow-hidden transition-all hover:border-blue-500/30">
              
              {/* Session Header (Clickable) */}
              <button 
                onClick={() => toggleSession(session.timestamp)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-white">{session.label}</h3>
                    <p className="text-sm text-gray-400">{session.count} Posts Scraped • Avg Likes: {Math.round(session.avg_likes)}</p>
                  </div>
                </div>
                {expandedSession === session.timestamp ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>

              {/* Session Content (Posts Grid) */}
              {expandedSession === session.timestamp && (
                <div className="border-t border-white/10 bg-[#0d1117] p-6 animate-in slide-in-from-top-2 duration-200">
                  {loadingPosts ? (
                    <div className="flex justify-center py-8 text-blue-400 gap-2">
                       <Loader2 className="animate-spin" /> Loading posts...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sessionPosts.map((post) => (
                        <div key={post._id} className="relative">
                          <LinkedInPostPreview content={post.content} />
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur border border-white/10 text-white px-2 py-1 rounded text-xs font-mono">
                             ❤️ {post.likes}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViralDatabase;
import React, { useState, useEffect } from 'react';
import { Send, Clock, Sparkles, RefreshCw, Layers } from 'lucide-react';
import LinkedInPostPreview from '../components/LinkedInPostPreview';

interface Session {
  label: string;
  count: number;
  timestamp: number;
}

const PostGenerator: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number>(0);
  
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{content: string, image: string} | null>(null);

  // 1. Load Sessions on Mount
  useEffect(() => {
    fetch('http://localhost:8000/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        if(data.length > 0) setSelectedSession(data[0].timestamp);
      })
      .catch(err => console.error("Failed to load sessions", err));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedPost(null);
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            topic, 
            tone, 
            session_timestamp: selectedSession // Sending the batch ID
        }),
      });
      const data = await response.json();
      setGeneratedPost(data);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      
      {/* LEFT COLUMN: Controls */}
      <div className="space-y-6">
        
        <div className="bg-[#161b22] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-blue-500" />
            AI Generator
          </h2>

          <div className="space-y-6">
            
            {/* 1. SESSION SELECTOR */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Select Harvest Batch
              </label>
              <div className="relative">
                <select 
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(Number(e.target.value))}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-lg p-3 text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={0}>General (Use All Data)</option>
                  {sessions.map((s) => (
                    <option key={s.timestamp} value={s.timestamp}>
                      📅 {s.label} — ({s.count} Posts Scraped)
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none">
                  <Layers className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The AI will mimic the viral trends found in this specific time slot.
              </p>
            </div>

            {/* 2. TOPIC (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Topic (Optional)
              </label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Leave empty to auto-detect trend from batch..."
                className="w-full bg-[#0d1117] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* 3. TONE */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {['Professional', 'Controversial', 'Storytelling'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`p-2 rounded-lg text-sm border transition-all ${
                      tone === t 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'border-gray-700 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              {loading ? <RefreshCw className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
              {loading ? "Analyzing & Writing..." : "Generate Viral Post"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Preview */}
      <div className="flex flex-col items-center">
        <h3 className="text-gray-400 mb-4 text-sm font-medium uppercase tracking-wider">Live Preview</h3>
        {generatedPost ? (
          <LinkedInPostPreview content={generatedPost.content} image={generatedPost.image} />
        ) : (
          <div className="w-full h-[400px] border-2 border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-600 gap-4 bg-[#161b22]/50">
            <Sparkles className="h-10 w-10 opacity-20" />
            <p>Select a batch and click generate</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PostGenerator;
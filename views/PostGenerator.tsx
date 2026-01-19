import React, { useState, useEffect } from 'react';
import { 
  Send, Clock, Sparkles, RefreshCw, Layers, Copy, Repeat, 
  Image as ImageIcon, X, LayoutGrid, List, History 
} from 'lucide-react';
import LinkedInPostPreview from '../components/LinkedInPostPreview';

interface Session {
  label: string;
  count: number;
  timestamp: number;
}

const PostGenerator: React.FC = () => {
  // --- STATE ---
  const [mode, setMode] = useState<'trend' | 'remix'>('trend');
  const [historyView, setHistoryView] = useState<'grid' | 'list'>('grid');
  
  // Data
  const [sessions, setSessions] = useState<Session[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<number>(0);
  
  // Inputs
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  
  // Remix Inputs
  const [refCaption, setRefCaption] = useState('');
  const [refImageBase64, setRefImageBase64] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Loading States
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{content: string, image: string} | null>(null);

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    // 1. Fetch Sessions
    fetch('http://localhost:8000/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        if(data.length > 0) setSelectedSession(data[0].timestamp);
      })
      .catch(err => console.error("Failed to load sessions", err));

    // 2. Fetch History
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('http://localhost:8000/history'); 
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
    setLoadingHistory(false);
  };

  // --- HANDLERS ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => setRefImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setRefImageBase64('');
    setPreviewUrl('');
  };

  const handleGenerate = async () => {
    if (mode === 'remix' && (!refCaption || !topic)) {
      alert("Please enter the original caption and a new topic.");
      return;
    }

    setLoading(true);
    setGeneratedPost(null);
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            mode,
            topic, 
            tone, 
            session_timestamp: selectedSession,
            reference_caption: refCaption,
            reference_image_base64: refImageBase64
        }),
      });
      const data = await response.json();
      setGeneratedPost(data);
      
      // Refresh history after generation
      fetchHistory();
      
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-12">
      
      {/* =========================================
          SECTION 1: THE STUDIO (GENERATOR)
      ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: CONTROLS */}
        <div className="space-y-6">
          <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="text-blue-500 fill-blue-500/20" />
              Creative Studio
            </h2>

            {/* MODE TABS */}
            <div className="flex bg-[#0d1117] p-1.5 rounded-xl mb-8 border border-gray-800">
              <button 
                onClick={() => setMode('trend')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  mode === 'trend' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="h-4 w-4" /> Trend Analysis
              </button>
              <button 
                onClick={() => setMode('remix')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  mode === 'remix' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Repeat className="h-4 w-4" /> Remix Mode
              </button>
            </div>

            <div className="space-y-6">
              
              {/* --- TREND MODE INPUTS --- */}
              {mode === 'trend' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Source</label>
                    <div className="relative group">
                      <select 
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(Number(e.target.value))}
                        className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-all group-hover:border-gray-600"
                      >
                        <option value={0}>🌐 General Trends (Global Data)</option>
                        {sessions.map((s) => (
                          <option key={s.timestamp} value={s.timestamp}>
                            📅 {s.label} — ({s.count} Posts)
                          </option>
                        ))}
                      </select>
                      <Layers className="absolute right-4 top-4 h-5 w-5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* --- REMIX MODE INPUTS --- */}
              {mode === 'remix' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Original Content</label>
                    <textarea 
                      value={refCaption}
                      onChange={(e) => setRefCaption(e.target.value)}
                      placeholder="Paste the viral post text here..."
                      className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-white h-28 focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
                    />
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    {!previewUrl ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-xl cursor-pointer bg-[#0d1117] hover:bg-gray-800 hover:border-purple-500/50 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="p-3 bg-gray-800 rounded-full mb-3 group-hover:bg-purple-500/20 transition-colors">
                                <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
                              </div>
                              <p className="text-xs text-gray-500 group-hover:text-gray-300">Upload Visual Reference (Optional)</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    ) : (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-purple-500/50 group">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                            <span className="text-xs text-white font-medium">Reference Image Loaded</span>
                          </div>
                          <button onClick={clearImage} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm">
                              <X className="h-4 w-4 text-white" />
                          </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- COMMON INPUTS --- */}
              <div className="pt-6 border-t border-gray-800 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {mode === 'trend' ? 'Topic (Optional)' : 'New Topic Context'}
                  </label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={mode === 'trend' ? "Leave empty to auto-detect trends..." : "What is your new post about?"}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Voice & Tone</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Professional', 'Controversial', 'Storytelling'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                          tone === t 
                          ? (mode === 'trend' ? 'bg-blue-600 border-blue-500' : 'bg-purple-600 border-purple-500') + ' text-white shadow-lg transform scale-105' 
                          : 'border-gray-700 text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                  loading ? 'bg-gray-700 cursor-not-allowed' : 
                  mode === 'trend' 
                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white' 
                    : 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white'
                }`}
              >
                {loading ? <RefreshCw className="animate-spin h-6 w-6" /> : <Sparkles className="h-6 w-6 fill-white/20" />}
                {loading ? "Generating Magic..." : "Generate Viral Post"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: PREVIEW AREA */}
        <div className="flex flex-col justify-start">
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Live Preview</h3>
             {generatedPost && <span className="text-green-400 text-xs flex items-center gap-1">● Generated Successfully</span>}
          </div>
          
          {generatedPost ? (
            <div className="animate-in zoom-in-95 duration-500">
               <LinkedInPostPreview content={generatedPost.content} image={generatedPost.image} />
            </div>
          ) : (
            <div className="w-full h-full min-h-[500px] border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-600 gap-6 bg-[#161b22]/30">
              <div className={`p-6 rounded-full bg-gradient-to-br ${mode === 'trend' ? 'from-blue-500/10 to-cyan-500/10' : 'from-purple-500/10 to-pink-500/10'}`}>
                 {mode === 'trend' ? <Clock className="h-12 w-12 opacity-40" /> : <Repeat className="h-12 w-12 opacity-40" />}
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-400">Ready to Create</p>
                <p className="text-sm text-gray-600 mt-1">Select your settings and hit generate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          SECTION 2: HISTORY GALLERY
      ========================================= */}
      <div className="pt-10 border-t border-gray-800">
        
        {/* Gallery Header */}
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <History className="h-5 w-5 text-gray-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Recent Creations</h3>
                <p className="text-xs text-gray-500">Your AI generation history</p>
              </div>
           </div>

           {/* Layout Toggle */}
           <div className="flex bg-[#161b22] p-1 rounded-lg border border-gray-700">
              <button 
                onClick={() => setHistoryView('grid')}
                className={`p-2 rounded-md transition-all ${historyView === 'grid' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setHistoryView('list')}
                className={`p-2 rounded-md transition-all ${historyView === 'list' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <List className="h-4 w-4" />
              </button>
           </div>
        </div>

        {/* Gallery Content */}
        {loadingHistory ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Loading your masterpiece archive...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-[#161b22]/50 rounded-2xl border border-gray-800 border-dashed">
            <p className="text-gray-500">No history found. Generate something above!</p>
          </div>
        ) : (
          <div className={`gap-6 ${historyView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col space-y-8'}`}>
            {history.map((post) => (
              <div key={post._id || post.timestamp} className="group relative">
                {/* Visualizing the Post */}
                <div className={`${historyView === 'list' ? 'max-w-3xl mx-auto' : ''}`}>
                   <LinkedInPostPreview content={post.content} image={post.image_base64 || post.image} />
                </div>
                
                {/* Meta Badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-xs font-mono text-gray-300 px-3 py-1 rounded-full border border-white/10 shadow-lg">
                   {post.mode === 'trend' ? '⚡ Trend' : '♻️ Remix'} • {post.topic || 'Auto-Detect'}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PostGenerator;
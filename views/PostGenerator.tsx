import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import LinkedInPostPreview from '../components/LinkedInPostPreview';

const TONES = ['Professional', 'Witty', 'Storyteller'];

const PostGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(
    'Your AI-generated LinkedIn post will appear here. Start by entering a topic and selecting a tone.'
  );

  const handleGenerate = async () => {
    if (!topic) return;
    
    // 1. Start Loading
    setIsLoading(true);

    try {
      // 2. Call your Python Backend
      // Make sure your backend is running on port 8000!
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          tone: tone
        }),
      });

      // 3. Handle the response
      if (response.ok) {
        const data = await response.json();
        // Update the preview with the text coming from Python
        setGeneratedPost(data.content);
      } else {
        console.error("Server Error:", response.status);
        alert("Server error! Check your Python terminal.");
      }

    } catch (error) {
      console.error("Connection Failed:", error);
      alert("Is your Python backend running? (Error: Connection Refused)");
    }

    // 4. Stop Loading
    setIsLoading(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 h-full">
      {/* Input Column */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Topic</h2>
          <p className="text-sm text-white/50 mb-3">What do you want to write about? Be specific for best results.</p>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The future of remote work for SaaS companies..."
            className="w-full h-32 bg-zinc-900 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Tone of Voice</h2>
          <p className="text-sm text-white/50 mb-3">Select the tone that best fits your brand.</p>
          <div className="flex gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                  tone === t
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent border-white/20 hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Generating...
            </>
          ) : (
            'Generate Viral Post'
          )}
        </button>
      </div>

      {/* Preview Column */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4 self-start">Live Preview</h2>
        <LinkedInPostPreview content={generatedPost} />
      </div>
    </div>
  );
};

export default PostGenerator;
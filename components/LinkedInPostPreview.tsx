import React from 'react';
import { ThumbsUp, MessageCircle, Repeat, Send } from 'lucide-react';

interface LinkedInPostPreviewProps {
  content: string;
  image?: string | null; // <--- ADDED THIS (Optional image)
}

const LinkedInPostPreview: React.FC<LinkedInPostPreviewProps> = ({ content, image }) => {
  const [showMore, setShowMore] = React.useState(false);
  const displayContent = content.length > 200 && !showMore ? `${content.substring(0, 200)}...` : content;

  return (
    <div className="bg-[#1b1f23] rounded-lg border border-white/10 p-4 w-full max-w-lg mx-auto shadow-xl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <img src="https://picsum.photos/seed/user/100/100" alt="User Avatar" className="h-12 w-12 rounded-full" />
        <div className="flex-grow">
          <p className="font-semibold text-white">Your Name</p>
          <p className="text-xs text-white/60">SaaS Founder | Building in Public | Viral Marketing Expert</p>
          <p className="text-xs text-white/60">1d • Edited</p>
        </div>
        <button className="text-sm font-semibold text-blue-400 hover:text-blue-300">+ Follow</button>
      </div>

      {/* Text Content */}
      <div className="text-sm text-white/90 whitespace-pre-wrap mb-3">
        <p>{displayContent}</p>
        {content.length > 200 && !showMore && (
          <button onClick={() => setShowMore(true)} className="text-white/60 font-semibold hover:text-white/80">
            ...see more
          </button>
        )}
      </div>

      {/* 🖼️ AI IMAGE DISPLAY (The New Part) */}
      {image && (
        <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
          <img 
            src={image} 
            alt="AI Generated Visual" 
            className="w-full h-auto object-cover max-h-[400px]" 
          />
        </div>
      )}

      {/* Reactions Bar */}
      <div className="flex justify-between items-center text-xs text-white/60 pb-2 border-b border-white/10">
          <div>👍❤️😂 1,234</div>
          <div>56 comments • 78 reposts</div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-4 pt-2 text-sm text-white/70 font-semibold">
        <button className="flex items-center justify-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors">
          <ThumbsUp className="h-5 w-5" /> Like
        </button>
        <button className="flex items-center justify-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors">
          <MessageCircle className="h-5 w-5" /> Comment
        </button>
        <button className="flex items-center justify-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors">
          <Repeat className="h-5 w-5" /> Repost
        </button>
        <button className="flex items-center justify-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors">
          <Send className="h-5 w-5" /> Send
        </button>
      </div>
    </div>
  );
};

export default LinkedInPostPreview;
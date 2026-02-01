import React, { useEffect, useState, useRef } from 'react';
import { X, Terminal, Loader2, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScraperStatus {
  status: 'IDLE' | 'RUNNING' | 'WAITING_FOR_OTP' | 'COMPLETED' | 'ERROR';
  message: string;
  logs: string[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScraperStatusModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [scraperState, setScraperState] = useState<ScraperStatus>({
    status: 'IDLE',
    message: 'Initializing...',
    logs: []
  });
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- 1. POLL STATUS EVERY 1 SECOND ---
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8000/scraper-status');
        const data = await res.json();
        setScraperState(data);
        
        // Auto-scroll logs to bottom
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (e) {
        console.error("Poll error", e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // --- 2. SUBMIT OTP ---
  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setSendingOtp(true);
    try {
        await fetch('http://localhost:8000/submit-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp })
        });
        setOtp(''); // Clear input
    } catch (e) {
        alert("Failed to send OTP");
    }
    setSendingOtp(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Window */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-zinc-950">
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                    scraperState.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' :
                    scraperState.status === 'WAITING_FOR_OTP' ? 'bg-amber-500 animate-pulse' :
                    scraperState.status === 'COMPLETED' ? 'bg-green-500' :
                    scraperState.status === 'ERROR' ? 'bg-red-500' : 'bg-zinc-500'
                }`} />
                <span className="font-mono text-sm font-bold text-white uppercase">
                    System Terminal
                </span>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Console Output (Logs) */}
        <div className="flex-grow p-4 bg-black font-mono text-xs text-green-400 overflow-y-auto h-64 space-y-1">
            {scraperState.logs.map((log, i) => (
                <div key={i} className="opacity-80 border-l-2 border-green-900 pl-2">
                    <span className="text-zinc-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                </div>
            ))}
            <div ref={logsEndRef} />
        </div>

        {/* Status Bar & OTP Input */}
        <div className="p-4 bg-zinc-900 border-t border-white/10">
            {scraperState.status === 'WAITING_FOR_OTP' ? (
                <div className="animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-amber-400 mb-3 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        LinkedIn Security Check Required
                    </div>
                    <form onSubmit={handleSubmitOtp} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Enter 6-digit PIN" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="flex-1 bg-zinc-800 border border-amber-500/50 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            disabled={sendingOtp}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {sendingOtp ? <Loader2 className="animate-spin w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                            Submit
                        </button>
                    </form>
                </div>
            ) : (
                <div className="flex items-center justify-between text-zinc-400 text-sm">
                    <div className="flex items-center gap-2">
                        {scraperState.status === 'RUNNING' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                        {scraperState.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <span>{scraperState.message}</span>
                    </div>
                    {scraperState.status === 'COMPLETED' && (
                        <button onClick={onClose} className="text-white hover:underline">Close</button>
                    )}
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default ScraperStatusModal;
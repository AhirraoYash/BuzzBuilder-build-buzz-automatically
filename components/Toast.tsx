
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-10 right-10 flex items-center gap-3 bg-zinc-800 border border-white/10 rounded-lg p-4 shadow-lg z-50"
        >
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-white/90 text-sm">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

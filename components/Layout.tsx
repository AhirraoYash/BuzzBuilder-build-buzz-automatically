import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, Bot, Settings, Rocket, Database } from 'lucide-react'; // <--- 1. Added Database icon
import type { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems = [
  { name: 'Dashboard' as View, icon: LayoutDashboard },
  { name: 'Trend Analyzer' as View, icon: BarChart3 },
  { name: 'Post Generator' as View, icon: Bot },
  { name: 'Viral Database' as View, icon: Database }, // <--- 2. Added New Menu Item
  { name: 'Settings' as View, icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  return (
    <div className="flex h-screen w-full font-sans bg-[#0d1117] text-white">
      <aside className="fixed left-0 top-0 h-full w-16 md:w-56 bg-black/30 backdrop-blur-xl border-r border-white/10 z-10 flex flex-col items-center md:items-start p-4 transition-all duration-300">
        <div className="flex items-center gap-2 mb-10 w-full justify-center md:justify-start">
            <Rocket className="text-blue-500 h-8 w-8" />
            <span className="hidden md:inline text-xl font-bold text-white/90">VaxTrack</span>
        </div>
        <nav className="flex flex-col gap-2 w-full">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveView(item.name)}
              className={`relative flex items-center gap-3 p-3 rounded-lg text-sm transition-colors w-full justify-center md:justify-start ${
                activeView === item.name ? 'text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden md:inline">{item.name}</span>
              {activeView === item.name && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-0 h-full w-full bg-white/10 rounded-lg -z-10"
                />
              )}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 ml-16 md:ml-56 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 h-full">
            {children}
        </div>
      </main>
    </div>
  );
};
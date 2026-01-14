
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/Layout';
import Dashboard from './views/Dashboard';
import TrendAnalyzer from './views/TrendAnalyzer';
import PostGenerator from './views/PostGenerator';
import Settings from './views/Settings';
import type { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Trend Analyzer':
        return <TrendAnalyzer />;
      case 'Post Generator':
        return <PostGenerator />;
      case 'Settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="w-full h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default App;

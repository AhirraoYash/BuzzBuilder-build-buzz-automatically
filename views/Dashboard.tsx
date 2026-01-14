
import React from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart, FileText, MessageSquare, Link, Settings } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
  <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 flex flex-col justify-between">
    <div className="flex justify-between items-center">
      <h3 className="text-white/70 text-sm font-medium">{title}</h3>
      <Icon className="text-white/30 h-5 w-5" />
    </div>
    <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mt-2">{value}</p>
  </div>
);

const ActivityItem = ({ text, icon: Icon }: { text: string; icon: React.ElementType }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="bg-zinc-800 p-2 rounded-full">
      <Icon className="h-4 w-4 text-white/60" />
    </div>
    <p className="text-white/70">{text}</p>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
        <StatCard title="Total Reach" value="1.2M" icon={Users} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
        <StatCard title="Avg Engagement" value="8.5%" icon={BarChart} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
        <StatCard title="Viral Posts" value="12" icon={FileText} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }} className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Growth Analytics</h3>
        <div className="w-full h-48 bg-zinc-800/50 rounded-lg flex items-center justify-center">
            <p className="text-white/40">Graph data will be displayed here</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} className="bg-zinc-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Feed</h3>
        <div className="space-y-4">
          <ActivityItem text="New viral post generated" icon={FileText} />
          <ActivityItem text="Analyzed #SaaS hashtag" icon={BarChart} />
          <ActivityItem text="Comment received on 'Series B' post" icon={MessageSquare} />
          <ActivityItem text="LinkedIn account connected" icon={Link} />
          <ActivityItem text="Settings updated" icon={Settings} />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

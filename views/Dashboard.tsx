import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  PenTool, 
  Activity, 
  Clock,
  Loader2,
  Search
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <h3 className="text-white/60 text-sm font-medium mb-1">{title}</h3>
    <p className="text-4xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
        {value}
    </p>
    <p className="text-xs text-white/30 mt-2">{subtitle}</p>
  </div>
);

const ActivityItem = ({ action, details, time }: any) => {
    // Convert timestamp to relative time (e.g., "2 hours ago")
    const date = new Date(time * 1000); // Assuming Python sends seconds
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
            <div className="bg-zinc-800 p-2.5 rounded-full border border-white/5">
                <PenTool className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex-1">
                <p className="text-sm text-white/90 font-medium">{action}</p>
                <p className="text-xs text-white/50 mt-0.5">{details}</p>
            </div>
            <span className="text-[10px] text-white/30 whitespace-nowrap">{timeString}</span>
        </div>
    );
};

// --- Main Dashboard ---

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_scraped: 0,
    total_generated: 0,
    recent_activity: []
  });

  // Mock Graph Data (Since we are just counting for now)
  const graphData = [
    { name: 'Mon', scraped: 10, generated: 2 },
    { name: 'Tue', scraped: 15, generated: 5 },
    { name: 'Wed', scraped: 8, generated: 3 },
    { name: 'Thu', scraped: 20, generated: 8 },
    { name: 'Fri', scraped: 12, generated: 4 },
    { name: 'Sat', scraped: 25, generated: 10 },
    { name: 'Sun', scraped: stats.total_scraped, generated: stats.total_generated },
  ];

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/analytics/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    };
    fetchStats();
  }, []);

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/50">Real-time overview of your AI content engine.</p>
      </motion.div>

      {/* 1. Real Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
          <StatCard 
            title="Total Scraped Posts" 
            value={loading ? "..." : stats.total_scraped} 
            subtitle="Viral posts analyzed from LinkedIn"
            icon={Search} 
            color="bg-blue-500"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
          <StatCard 
            title="Total Generated" 
            value={loading ? "..." : stats.total_generated} 
            subtitle="Posts created by AI"
            icon={PenTool} 
            color="bg-purple-500"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
          <StatCard 
            title="Database Health" 
            value="Active" 
            subtitle="MongoDB Atlas Connected"
            icon={Database} 
            color="bg-green-500"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {/* 2. Graph (Visualizing the data) */}
        <motion.div 
            className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col min-h-[400px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.4 } }}
        >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Content Velocity
            </h3>
            <div className="flex-grow w-full h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData}>
                        <defs>
                            <linearGradient id="colorScraped" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="scraped" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScraped)" strokeWidth={3} name="Scraped" />
                        <Area type="monotone" dataKey="generated" stroke="#a855f7" fillOpacity={1} fill="url(#colorGen)" strokeWidth={3} name="Generated" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>

        {/* 3. Real Recent Activity */}
        <motion.div 
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.5 } }}
        >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Recent Creations
            </h3>
            
            <div className="space-y-2">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-white/30" /></div>
                ) : stats.recent_activity.length === 0 ? (
                    <p className="text-white/30 text-center py-10">No activity yet.</p>
                ) : (
                    stats.recent_activity.map((item: any, i) => (
                        <ActivityItem 
                            key={i} 
                            action={item.action} 
                            details={item.details} 
                            time={item.time} 
                        />
                    ))
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
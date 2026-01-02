import { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import AnalyticsChart from "../components/AnalyticsChart";

export default function Dashboard() {
  const [stats, setStats] = useState({ posts: 0, leads: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real counts for posts and leads to populate the stats
    const fetchData = async () => {
      try {
        const [postsRes, leadsRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/posts`, {
                headers: { "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY },
            }),
            fetch(`${import.meta.env.VITE_API_URL}/leads`, {
                headers: { "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY },
            })
        ]);

        const postsData = await postsRes.json();
        const leadsData = await leadsRes.json();

        setStats({
            posts: postsData.success ? postsData.count || postsData.data.length : 0,
            leads: leadsData.success ? leadsData.count || leadsData.data.length : 0
        });

      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Overview of your website performance
        </p>
      </div>

      <div className="animate-slide-up">
        <StatsCards leadsCount={stats.leads} postsCount={stats.posts} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnalyticsChart />
          </div>
          
          {/* Quick Actions / Recent Activity Placeholder */}
          <div className="p-6 rounded-2xl border border-white/5 bg-neutral-800/30 backdrop-blur-sm">
             <h3 className="text-lg font-semibold text-neutral-100 mb-4">Quick Actions</h3>
             <div className="space-y-3">
                 <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors group">
                     <span className="text-neutral-300 font-medium">Create New Post</span>
                     <span className="text-neutral-500 group-hover:text-emerald-400">→</span>
                 </button>
                 <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors group">
                     <span className="text-neutral-300 font-medium">Analyze Competitor</span>
                     <span className="text-neutral-500 group-hover:text-emerald-400">→</span>
                 </button>
                 <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors group">
                     <span className="text-neutral-300 font-medium">View Leads</span>
                     <span className="text-neutral-500 group-hover:text-emerald-400">→</span>
                 </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
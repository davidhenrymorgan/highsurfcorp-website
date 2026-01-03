import { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import AnalyticsChart from "../components/AnalyticsChart";
import { Icon } from "@iconify/react";

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

  if (isLoading) {
      return (
          <div className="flex-1 flex items-center justify-center">
              <Icon icon="solar:refresh-bold-duotone" className="text-4xl text-emerald-500 animate-spin" />
          </div>
      )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 p-6 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
            Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
            Overview of your website performance
            </p>
        </div>
      </div>

      <div className="animate-slide-up space-y-6">
        <StatsCards leadsCount={stats.leads} postsCount={stats.posts} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-h-[400px]">
            <AnalyticsChart />
          </div>
          
          {/* Quick Actions */}
          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h3>
             <div className="space-y-3">
                 {[
                     { label: "Create New Post", icon: "solar:pen-new-square-bold-duotone", href: "/edit/new" },
                     { label: "Analyze Competitor", icon: "solar:radar-2-bold-duotone", href: "/intelligence" },
                     { label: "View Leads", icon: "solar:users-group-rounded-bold-duotone", href: "/leads" }
                 ].map((action) => (
                    <a 
                        key={action.label}
                        href={action.href}
                        className="w-full flex items-center justify-between p-4 bg-gray-800/40 hover:bg-gray-800/80 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all group"
                    >
                         <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-gray-700/50 text-gray-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                                 <Icon icon={action.icon} className="text-xl" />
                             </div>
                             <span className="text-gray-300 font-medium group-hover:text-gray-100">{action.label}</span>
                         </div>
                         <Icon icon="solar:alt-arrow-right-linear" className="text-gray-500 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" />
                    </a>
                 ))}
             </div>
             
             {/* Mini Activity Feed (Mock) */}
             <div className="mt-8 pt-6 border-t border-white/5">
                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Recent Activity</h4>
                 <div className="space-y-4">
                     <div className="flex gap-3">
                         <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                         <div>
                             <p className="text-sm text-gray-300">New lead: <span className="font-medium text-white">Sarah Smith</span></p>
                             <p className="text-xs text-gray-500">2 hours ago</p>
                         </div>
                     </div>
                     <div className="flex gap-3">
                         <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                         <div>
                             <p className="text-sm text-gray-300">Published "Top 10 Trends"</p>
                             <p className="text-xs text-gray-500">5 hours ago</p>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

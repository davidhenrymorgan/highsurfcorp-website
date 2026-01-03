import { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import AnalyticsChart from "../components/AnalyticsChart";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

// Skeleton Component for smoother loading perception
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

export default function Dashboard() {
  const [stats, setStats] = useState({ posts: 0, leads: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    <div className="flex-1 flex flex-col min-w-0 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back, Admin.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      ) : (
        <div className="animate-slide-up space-y-6">
          <StatsCards leadsCount={stats.leads} postsCount={stats.posts} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 min-h-[450px]">
              <AnalyticsChart />
            </div>
            
            {/* Action Center */}
            <div className="flex flex-col gap-6">
              {/* Quick Actions */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    {[
                        { label: "Create Post", desc: "Write new content", icon: "solar:pen-new-square-bold-duotone", href: "/edit/new", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "Intelligence", desc: "Analyze competitors", icon: "solar:radar-2-bold-duotone", href: "/intelligence", color: "text-violet-400", bg: "bg-violet-500/10" },
                        { label: "Inquiries", desc: "View new leads", icon: "solar:users-group-rounded-bold-duotone", href: "/leads", color: "text-blue-400", bg: "bg-blue-500/10" }
                    ].map((action) => (
                      <Link 
                          key={action.label}
                          to={action.href}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                      >
                          <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-lg ${action.bg} ${action.color} ring-1 ring-inset ring-white/5`}>
                                  <Icon icon={action.icon} className="text-xl" />
                              </div>
                              <div>
                                <span className="block text-gray-200 font-medium text-sm">{action.label}</span>
                                <span className="block text-gray-500 text-xs">{action.desc}</span>
                              </div>
                          </div>
                          <Icon icon="solar:alt-arrow-right-linear" className="text-gray-600 group-hover:text-white transition-colors" />
                      </Link>
                    ))}
                </div>
              </div>

              {/* System Health / Storage (Static for now) */}
              <div className="glass-panel p-6 rounded-2xl flex-1">
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">System Status</h3>
                 <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Database (D1)</span>
                        <span className="text-emerald-400">Healthy</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[15%] rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">AI Tokens</span>
                        <span className="text-blue-400">8.2k used</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[42%] rounded-full" />
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
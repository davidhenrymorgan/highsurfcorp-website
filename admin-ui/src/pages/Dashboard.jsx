import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'published', 'draft'

  // Fetch posts from Cloudflare D1
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        headers: {
          "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format D1 dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* Toolbar */}
      <div className="px-6 py-6 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
            All Posts
          </h1>
          <button 
            onClick={fetchPosts}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <Icon icon="solar:refresh-linear" className="text-xl" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="relative flex-1 max-w-sm group">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3 top-2.5 text-slate-500 text-lg"
            />
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full bg-transparent border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none text-slate-200 placeholder-slate-600 focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Icon icon="solar:refresh-bold-duotone" className="text-4xl text-slate-600 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {posts.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                No posts found. Generate one with AI!
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Thumbnail Fallback */}
                    <div className="w-16 h-12 rounded-lg border border-white/10 bg-slate-800 flex items-center justify-center overflow-hidden">
                      {post.hero_image_url ? (
                        <img 
                          src={post.hero_image_url} 
                          alt="" 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={(e) => e.target.style.display = 'none'} 
                        />
                      ) : (
                        <Icon icon="solar:gallery-wide-linear" className="text-slate-600 text-xl" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {post.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mr-4">
                    {/* Status Badge */}
                    {post.draft === 1 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-600/30 bg-slate-500/10 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-green-500/20 bg-green-500/10 text-green-300 text-xs font-semibold uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Published
                      </span>
                    )}

                    <span className="text-sm text-slate-500 w-24 text-right">
                      {formatDate(post.published_at || post.created_at)}
                    </span>

                    <button className="text-slate-400 hover:text-blue-400 p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Icon icon="solar:pen-bold-duotone" className="text-lg" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
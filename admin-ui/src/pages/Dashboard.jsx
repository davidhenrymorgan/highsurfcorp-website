import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

export default function Dashboard() {
  const navigate = useNavigate();
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
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">
            All Posts
          </h1>
          <button
            onClick={fetchPosts}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
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
              className="absolute left-3 top-2.5 text-neutral-500 text-lg"
            />
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full bg-transparent border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none text-neutral-200 placeholder-neutral-600 focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Icon
              icon="solar:refresh-bold-duotone"
              className="text-4xl text-neutral-600 animate-spin"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-slide-up">
            {posts.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                No posts found. Generate one with AI!
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border border-white/10 bg-neutral-800/50 rounded-2xl hover:bg-neutral-800/80 transition-all group cursor-pointer backdrop-blur-sm"
                >
                  <div className="flex items-center gap-5 flex-1">
                    {/* Thumbnail Fallback */}
                    <div className="w-20 h-14 rounded-xl border border-white/5 bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                      {post.hero_image_url ? (
                        <img
                          src={post.hero_image_url}
                          alt=""
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <Icon
                          icon="solar:gallery-wide-linear"
                          className="text-neutral-700 text-2xl"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-neutral-200 group-hover:text-white transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                        {post.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 pl-4">
                    {/* Status Badge */}
                    {post.draft === 1 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-700/50 bg-neutral-800 text-neutral-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"></span>
                        Published
                      </span>
                    )}

                    <span className="text-sm text-neutral-500 w-28 text-right font-medium">
                      {formatDate(post.published_at || post.created_at)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit/${post.id}`);
                      }}
                      className="text-neutral-500 hover:text-emerald-400 p-2 hover:bg-emerald-500/10 rounded-xl transition-colors"
                      title="Edit Post"
                    >
                      <Icon icon="solar:pen-bold-duotone" className="text-xl" />
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

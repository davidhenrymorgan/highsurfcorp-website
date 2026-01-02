import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import PreviewModal from "../components/PreviewModal";

export default function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null); // For preview modal

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
      {/* Header */}
      <div className="px-6 py-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">
            Blog Posts
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your content and articles
          </p>
        </div>
        <button
            onClick={() => navigate('/edit/new')}
            className="flex items-center gap-2 bg-emerald-500 text-neutral-950 px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all"
        >
            <Icon icon="solar:pen-new-square-bold-duotone" className="text-xl"/>
            New Post
        </button>
      </div>

      {/* List */}
      <div className="flex-1 px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Icon
              icon="solar:refresh-bold-duotone"
              className="text-4xl text-neutral-600 animate-spin"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 animate-slide-up">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group relative flex items-center justify-between p-4 border border-white/5 bg-neutral-800/30 rounded-2xl hover:bg-neutral-800/50 hover:border-white/10 transition-all backdrop-blur-sm"
              >
                {/* Clickable Area for Preview */}
                <div
                  className="absolute inset-0 cursor-pointer z-0"
                  onClick={() => setSelectedPost(post)}
                />

                <div className="flex items-center gap-5 flex-1 z-10 pointer-events-none">
                  <div className="w-24 h-16 rounded-xl border border-white/5 bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
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
                    <h3 className="text-base font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                         <Icon icon="solar:calendar-linear"/>
                         {formatDate(post.published_at || post.created_at)}
                      </span>
                      {post.category && (
                          <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {post.category}
                          </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions (Above the clickable layer) */}
                <div className="flex items-center gap-4 z-20 pl-4 border-l border-white/5 ml-4">
                  {/* Status Badge */}
                  {post.draft === 1 ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-800 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                      Draft
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      Published
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${post.id}`);
                    }}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    title="Edit Post"
                  >
                    <Icon icon="solar:pen-bold-duotone" className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PreviewModal
        isOpen={!!selectedPost}
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State initialized with D1 schema defaults
  const [post, setPost] = useState({
    title: "",
    slug: "",
    body: "",
    meta_description: "",
    category: "General",
    hero_image_url: "",
    draft: 1,
    featured: 0,
  });

  // Fetch Post Data
  useEffect(() => {
    if (id === "new") {
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/posts/${id}`,
          {
            headers: { "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY },
          },
        );
        const data = await response.json();

        if (data.success) {
          setPost(data.data);
        } else {
          showNotification("error", "Failed to load post");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        showNotification("error", "Network error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure ID is included for the upsert operation
      const payload = { ...post, id };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        showNotification("success", "Post saved successfully");
      } else {
        showNotification("error", data.error || "Failed to save");
      }
    } catch (error) {
      showNotification("error", "Network error saving post");
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-950 text-slate-500">
        <Icon
          icon="solar:refresh-bold-duotone"
          className="text-4xl animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-slate-300 overflow-hidden">
      {/* --- Top Bar --- */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gray-950/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <Icon icon="solar:arrow-left-linear" className="text-xl" />
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <h1 className="text-lg font-semibold text-white truncate max-w-md">
            {post.title || "Untitled Post"}
          </h1>
          {post.slug && (
            <a
              href={`https://highsurfcorp.com/blog/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-2 bg-blue-500/10 px-2 py-1 rounded"
            >
              View Live <Icon icon="solar:arrow-right-up-linear" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          {notification && (
            <div
              className={`text-sm px-3 py-1.5 rounded-md animate-fade-in ${
                notification.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {notification.message}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <Icon icon="solar:refresh-linear" className="animate-spin" />
            ) : (
              <Icon icon="solar:disk-bold-duotone" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* --- Main Content Layout --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area (Left) */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Title & Slug Input */}
            <div className="space-y-4">
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                placeholder="Post Title"
                className="w-full bg-transparent text-4xl font-bold text-white placeholder-slate-700 focus:outline-none"
              />
              <div className="flex items-center gap-3 text-slate-500 text-sm group">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-600">
                  SLUG:
                </span>
                <input
                  type="text"
                  value={post.slug}
                  onChange={(e) => setPost({ ...post, slug: e.target.value })}
                  className="bg-transparent border-b border-dashed border-slate-800 group-hover:border-slate-600 focus:border-blue-500 focus:outline-none text-slate-400 w-full max-w-md transition-colors"
                />
              </div>
            </div>

            {/* Body Textarea (HTML) */}
            <div className="relative group">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-wider text-slate-600 font-semibold">
                  Content (HTML)
                </label>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-500 border border-white/5">
                  Raw HTML Mode
                </span>
              </div>

              <textarea
                value={post.body}
                onChange={(e) => setPost({ ...post, body: e.target.value })}
                placeholder="<p>Write your content here...</p>"
                className="w-full h-[60vh] bg-white/[0.02] border border-white/5 rounded-xl p-6 text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white/5 font-mono text-sm leading-relaxed resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings (Right) */}
        <div className="w-80 border-l border-white/5 bg-gray-950 p-6 overflow-y-auto space-y-8 h-full">
          {/* Status Toggle */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
              <button
                onClick={() => setPost({ ...post, draft: 1 })}
                className={`py-2 text-xs font-medium rounded-md transition-all ${
                  post.draft === 1
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setPost({ ...post, draft: 0 })}
                className={`py-2 text-xs font-medium rounded-md transition-all ${
                  post.draft === 0
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/20"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Published
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hero Image
            </label>

            <input
              type="text"
              placeholder="https://..."
              value={post.hero_image_url || ""}
              onChange={(e) =>
                setPost({ ...post, hero_image_url: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
            />

            <div className="aspect-video rounded-lg border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center relative group">
              {post.hero_image_url ? (
                <img
                  src={post.hero_image_url}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="text-center">
                  <Icon
                    icon="solar:gallery-wide-linear"
                    className="text-2xl text-slate-700 mx-auto mb-1"
                  />
                  <span className="text-[10px] text-slate-600">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Meta Data */}
          <div className="space-y-5 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Category
              </label>
              <input
                type="text"
                value={post.category || ""}
                onChange={(e) => setPost({ ...post, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Meta Description
              </label>
              <textarea
                rows={4}
                value={post.meta_description || ""}
                onChange={(e) =>
                  setPost({ ...post, meta_description: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

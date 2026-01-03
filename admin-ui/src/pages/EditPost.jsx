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
      <div className="h-screen w-full flex items-center justify-center bg-gray-950 text-gray-500">
        <Icon
          icon="solar:refresh-bold-duotone"
          className="text-4xl animate-spin text-emerald-500"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-300 overflow-hidden font-sans">
      {/* --- Top Bar --- */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gray-900/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
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
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 ml-2 bg-emerald-500/10 px-3 py-1.5 rounded-full font-medium transition-colors"
            >
              View Live <Icon icon="solar:arrow-right-up-linear" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          {notification && (
            <div
              className={`text-sm px-4 py-2 rounded-full animate-fade-in ${
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
            className="btn-primary flex items-center gap-2"
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
                className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-700 focus:outline-none"
              />
              <div className="flex items-center gap-3 text-gray-500 text-sm group">
                <span className="font-mono text-xs uppercase tracking-wider text-gray-600">
                  SLUG:
                </span>
                <input
                  type="text"
                  value={post.slug}
                  onChange={(e) => setPost({ ...post, slug: e.target.value })}
                  className="bg-transparent border-b border-dashed border-gray-800 group-hover:border-gray-600 focus:border-emerald-500 focus:outline-none text-gray-400 w-full max-w-md transition-colors"
                />
              </div>
            </div>

            {/* Body Textarea (HTML) */}
            <div className="relative group">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">
                  Content (HTML)
                </label>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 border border-white/5">
                  Raw HTML Mode
                </span>
              </div>

              <textarea
                value={post.body}
                onChange={(e) => setPost({ ...post, body: e.target.value })}
                placeholder="<p>Write your content here...</p>"
                className="w-full h-[60vh] bg-gray-900/30 border border-white/5 rounded-2xl p-6 text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:bg-gray-900/50 font-mono text-sm leading-relaxed resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings (Right) */}
        <div className="w-80 border-l border-white/5 bg-gray-900/30 backdrop-blur-xl p-6 overflow-y-auto space-y-8 h-full z-10">
          {/* Status Toggle */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800/50 rounded-xl border border-white/5">
              <button
                onClick={() => setPost({ ...post, draft: 1 })}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  post.draft === 1
                    ? "bg-gray-700 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setPost({ ...post, draft: 0 })}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  post.draft === 0
                    ? "bg-emerald-500 text-gray-950 shadow-sm shadow-emerald-500/20"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Published
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Hero Image
            </label>

            <input
              type="text"
              placeholder="https://..."
              value={post.hero_image_url || ""}
              onChange={(e) =>
                setPost({ ...post, hero_image_url: e.target.value })
              }
              className="input-base"
            />

            <div className="aspect-video rounded-xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center relative group">
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
                    className="text-2xl text-gray-700 mx-auto mb-1"
                  />
                  <span className="text-[10px] text-gray-600">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Meta Data */}
          <div className="space-y-5 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </label>
              <input
                type="text"
                value={post.category || ""}
                onChange={(e) => setPost({ ...post, category: e.target.value })}
                className="input-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Meta Description
              </label>
              <textarea
                rows={4}
                value={post.meta_description || ""}
                onChange={(e) =>
                  setPost({ ...post, meta_description: e.target.value })
                }
                className="input-base resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
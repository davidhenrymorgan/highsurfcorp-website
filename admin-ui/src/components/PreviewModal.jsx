import { useEffect } from "react";
import { Icon } from "@iconify/react";

export default function PreviewModal({ isOpen, onClose, post }) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-neutral-900 border border-white/10 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-neutral-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
              Preview Mode
            </span>
            <div className="h-4 w-px bg-white/10" />
            <h2 className="text-lg font-semibold text-neutral-200 truncate max-w-md">
              {post.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
                href={`https://highsurfcorp.com/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 hover:bg-white/5 rounded-full text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Open Live URL"
            >
                <Icon icon="solar:arrow-right-up-linear" className="text-xl" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors"
            >
              <Icon icon="solar:close-circle-bold-duotone" className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Content - Mimics the actual blog layout */}
        <div className="flex-1 overflow-y-auto p-8 bg-neutral-950">
          <article className="max-w-3xl mx-auto prose prose-invert prose-emerald lg:prose-lg">
            {/* Hero Image */}
            {post.hero_image_url && (
              <img
                src={post.hero_image_url}
                alt={post.title}
                className="w-full aspect-video object-cover rounded-2xl mb-8 border border-white/10 bg-neutral-900"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}

            {/* Title & Meta */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-neutral-400 text-sm mb-8">
               <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
               <span className="w-1 h-1 bg-neutral-600 rounded-full"/>
               <span className="text-emerald-400">{post.category || "General"}</span>
            </div>

            {/* Body Content */}
            <div
              dangerouslySetInnerHTML={{ __html: post.body }}
              className="text-neutral-300 leading-relaxed space-y-4"
            />
          </article>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function ReplyModal({ isOpen, onClose, email, onSent }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill fields when email changes
  useEffect(() => {
    if (email) {
      setTo(email.from_email || "");
      setSubject(
        email.subject?.startsWith("Re:")
          ? email.subject
          : `Re: ${email.subject || "Your message"}`,
      );
      setHtml("");
    }
  }, [email]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTo("");
      setSubject("");
      setHtml("");
      setError("");
    }
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!to.trim() || !subject.trim() || !html.trim()) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/emails/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
          },
          body: JSON.stringify({
            to: to.trim(),
            subject: subject.trim(),
            html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333;">${html.trim().replace(/\n/g, "<br>")}</div>`,
            replyToEmailId: email?.id,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        onSent?.();
        onClose();
      } else {
        setError(data.error || "Failed to send email");
      }
    } catch (err) {
      setError(err.message || "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass rounded-3xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto bg-neutral-900/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Icon
              icon="solar:plain-bold-duotone"
              className="text-2xl text-emerald-400"
            />
            <h2 className="text-lg font-semibold text-neutral-50">
              Reply to Email
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <Icon icon="solar:close-circle-bold-duotone" className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                To <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 transition-all placeholder-neutral-600 text-neutral-300 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Re: Your message"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 transition-all placeholder-neutral-600 text-neutral-300 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50"
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Type your reply here..."
                disabled={isLoading}
                rows={8}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 transition-all placeholder-neutral-600 text-neutral-300 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 resize-none"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Plain text - line breaks will be preserved
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <Icon
                  icon="solar:danger-triangle-bold-duotone"
                  className="text-lg shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 text-neutral-300 text-sm font-medium px-4 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 text-neutral-950 text-sm font-bold px-4 py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg bg-white hover:bg-neutral-200 shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Icon
                      icon="solar:refresh-bold-duotone"
                      className="text-lg animate-spin"
                    />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="solar:plain-bold-duotone" className="text-lg" />
                    <span>Send Reply</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

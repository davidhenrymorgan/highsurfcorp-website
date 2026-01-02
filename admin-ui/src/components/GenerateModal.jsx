import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "educational", label: "Educational" },
  { value: "urgent", label: "Urgent" },
];

export default function GenerateModal({ isOpen, onClose }) {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTopic("");
      setKeywords("");
      setTone("professional");
      setResult(null);
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

    if (!topic.trim()) {
      setError("Topic is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.trim(),
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // FIX: Handle the nested data structure from the API
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        // Fallback or error if structure is unexpected
        setResult(data); 
      }
    } catch (err) {
      setError(err.message || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!result) return;

    try {
      setIsLoading(true);
      setError("");

      // 1. Convert the AI outline structure into Blog HTML
      let bodyHtml = `<p class="lead">${result.meta_description}</p>`;
      
      if (result.outline && Array.isArray(result.outline)) {
        bodyHtml += result.outline.map(section => `
          <h2>${section.heading}</h2>
          <ul>
            ${section.content_points.map(point => `<li>${point}</li>`).join('')}
          </ul>
        `).join('');
      }

      // 2. Prepare the payload for D1
      const payload = {
        title: result.title,
        slug: result.slug,
        body: bodyHtml,
        meta_description: result.meta_description,
        category: "Draft",
        draft: 1,      // Mark as Draft
        featured: 0
      };

      // 3. Send to your CRUD API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': import.meta.env.VITE_ADMIN_KEY
        },
        body: JSON.stringify(payload)
      });

      const savedData = await response.json();

      if (savedData.success) {
        onClose();
        // 4. Refresh to show the new post in the list
        window.location.reload(); 
      } else {
        setError('Failed to save: ' + (savedData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      setError('Error saving draft. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass rounded-2xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Icon
              icon="solar:magic-stick-3-bold-duotone"
              className="text-2xl text-blue-400"
            />
            <h2 className="text-lg font-semibold text-white">
              Generate with AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Icon icon="solar:close-circle-bold-duotone" className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Topic Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Topic <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Seawall Maintenance"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-1 transition-all placeholder-slate-600 text-slate-300 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                />
              </div>

              {/* Keywords Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Keywords{" "}
                  <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., Brevard County, erosion, coastal protection"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-1 transition-all placeholder-slate-600 text-slate-300 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Comma-separated keywords to include
                </p>
              </div>

              {/* Tone Select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-1 transition-all text-slate-300 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.75rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.25em 1.25em",
                  }}
                >
                  {toneOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <Icon
                    icon="solar:danger-triangle-bold-duotone"
                    className="text-lg shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white text-sm font-medium px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Icon
                      icon="solar:refresh-bold-duotone"
                      className="text-lg animate-spin"
                    />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Icon
                      icon="solar:magic-stick-3-bold-duotone"
                      className="text-lg"
                    />
                    <span>Generate Content</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Success Header */}
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Icon
                  icon="solar:check-circle-bold-duotone"
                  className="text-lg"
                />
                <span className="font-medium">
                  Content generated successfully
                </span>
              </div>

              {/* Generated Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Generated Title
                </label>
                <div className="bg-white/5 border border-white/5 rounded-lg py-3 px-4 text-slate-200">
                  {result.title}
                </div>
              </div>

              {/* Generated Outline */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Generated Outline
                </label>
                <div className="bg-white/5 border border-white/5 rounded-lg py-3 px-4 text-slate-300 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {Array.isArray(result.outline) 
                    ? result.outline.map((section, idx) => (
                        <div key={idx} className="mb-2">
                          <strong className="text-white block mb-1">{section.heading}</strong>
                          <ul className="list-disc pl-4 text-slate-400">
                            {section.content_points.map((pt, i) => <li key={i}>{pt}</li>)}
                          </ul>
                        </div>
                      ))
                    : <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(result.outline, null, 2)}</pre>
                  }
                </div>
              </div>

              {/* Error on Save */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
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
                  onClick={() => setResult(null)}
                  disabled={isLoading}
                  className="flex-1 text-slate-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-50"
                >
                  <Icon icon="solar:refresh-bold-duotone" className="text-lg" />
                  <span>Generate Again</span>
                </button>
                <button
                  onClick={handleCreateDraft}
                  disabled={isLoading}
                  className="flex-1 text-white text-sm font-medium px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Icon icon="solar:refresh-bold-duotone" className="text-lg animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:document-add-bold-duotone" className="text-lg" />
                      <span>Create Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
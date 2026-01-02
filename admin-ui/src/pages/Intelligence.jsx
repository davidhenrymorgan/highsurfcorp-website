import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function Intelligence() {
  const [competitors, setCompetitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [url, setUrl] = useState("");
  const [pageLimit, setPageLimit] = useState(10);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [contentModal, setContentModal] = useState(null);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/intelligence/competitors`,
        {
          headers: {
            "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setCompetitors(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch competitors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCompetitor = async (e) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeStatus("Extracting data from website...");

    try {
      const progressInterval = setInterval(() => {
        setAnalyzeStatus((prev) => {
          if (prev.includes("Extracting")) return "Analyzing content structure...";
          if (prev.includes("structure")) return "Running AI analysis...";
          return prev;
        });
      }, 10000);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/intelligence/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
          },
          body: JSON.stringify({ url, limit: pageLimit }),
        },
      );

      clearInterval(progressInterval);

      const data = await response.json();

      if (data.success) {
        setUrl("");
        setShowForm(false);
        await fetchCompetitors();
        setExpandedId(data.data.id);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStatus("");
    }
  };

  const refreshCompetitor = async (id) => {
    setIsAnalyzing(true);
    setAnalyzeStatus("Refreshing analysis...");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/intelligence/competitors/${id}/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
          },
          body: JSON.stringify({ limit: 10 }),
        },
      );

      const data = await response.json();

      if (data.success) {
        await fetchCompetitors();
      } else {
        setError(data.error || "Refresh failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStatus("");
    }
  };

  const deleteCompetitor = async (id) => {
    if (!confirm("Are you sure you want to delete this competitor?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/intelligence/competitors/${id}`,
        {
          method: "DELETE",
          headers: {
            "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setCompetitors(competitors.filter((c) => c.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const viewContent = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/intelligence/competitors/${id}/content`,
        {
          headers: {
            "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setContentModal(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch content:", err);
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
      <div className="px-6 py-6 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">
              Competitor Intelligence
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Analyze competitor websites to generate better content
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-neutral-950 px-5 py-2.5 rounded-full text-sm font-bold transition-colors shadow-lg shadow-white/10"
          >
            <Icon icon="solar:radar-2-bold" className="text-lg" />
            Analyze Competitor
          </button>
        </div>

        {/* Analyze Form */}
        {showForm && (
          <div className="mb-6 p-6 bg-neutral-800/30 border border-white/10 rounded-2xl backdrop-blur-sm animate-slide-up">
            <form onSubmit={analyzeCompetitor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Competitor Website URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://competitor-website.com"
                  disabled={isAnalyzing}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Pages to Analyze
                </label>
                <select
                  value={pageLimit}
                  onChange={(e) => setPageLimit(Number(e.target.value))}
                  disabled={isAnalyzing}
                  className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23737373' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.75rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.25em 1.25em",
                  }}
                >
                  <option value={5} className="bg-neutral-900">5 pages (faster)</option>
                  <option value={10} className="bg-neutral-900">10 pages (recommended)</option>
                  <option value={15} className="bg-neutral-900">15 pages (thorough)</option>
                </select>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                  <Icon icon="solar:danger-triangle-linear" className="text-lg" />
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-5 py-2.5 rounded-full text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {isAnalyzing ? (
                    <>
                      <Icon
                        icon="solar:refresh-bold-duotone"
                        className="text-lg animate-spin"
                      />
                      {analyzeStatus}
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:play-bold" className="text-lg" />
                      Start Analysis
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="text-neutral-400 hover:text-white text-sm transition-colors px-4 py-2"
                >
                  Cancel
                </button>
              </div>

              {isAnalyzing && (
                <p className="text-xs text-neutral-500">
                  Analysis typically takes 30-90 seconds depending on website size.
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Competitors List */}
      <div className="flex-1 px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Icon
              icon="solar:refresh-bold-duotone"
              className="text-4xl text-neutral-600 animate-spin"
            />
          </div>
        ) : competitors.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              icon="solar:radar-2-linear"
              className="text-6xl text-neutral-700 mx-auto mb-4"
            />
            <p className="text-neutral-500">
              No competitors analyzed yet. Add one to get started!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-slide-up">
            {competitors.map((comp) => (
              <div
                key={comp.id}
                className="border border-white/10 bg-neutral-800/50 rounded-2xl overflow-hidden backdrop-blur-sm"
              >
                {/* Collapsed Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-800/80 transition-colors"
                  onClick={() =>
                    setExpandedId(expandedId === comp.id ? null : comp.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                      <Icon
                        icon="solar:global-linear"
                        className="text-xl text-emerald-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-200">
                        {comp.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {comp.pages_crawled} pages • Scanned{" "}
                        {formatDate(comp.crawled_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>
                        {comp.insights?.keywords?.length || 0} keywords
                      </span>
                      <span>{comp.insights?.gaps?.length || 0} gaps</span>
                    </div>

                    {comp.has_content === 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewContent(comp.id);
                        }}
                        className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"
                        title="View Content for Blog Generation"
                      >
                        <Icon icon="solar:document-text-linear" className="text-lg" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshCompetitor(comp.id);
                      }}
                      disabled={isAnalyzing}
                      className="p-2 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors disabled:opacity-50"
                      title="Refresh Analysis"
                    >
                      <Icon icon="solar:refresh-linear" className="text-lg" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCompetitor(comp.id);
                      }}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Icon
                        icon="solar:trash-bin-trash-linear"
                        className="text-lg"
                      />
                    </button>

                    <Icon
                      icon={
                        expandedId === comp.id
                          ? "solar:alt-arrow-up-linear"
                          : "solar:alt-arrow-down-linear"
                      }
                      className="text-lg text-neutral-500"
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === comp.id && (
                  <div className="border-t border-white/5 p-5 bg-neutral-900/30">
                    {/* Structured Data Section (from Firecrawl) */}
                    {comp.structured_data && Object.keys(comp.structured_data).length > 0 && (
                      <div className="mb-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                        <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <Icon icon="solar:database-linear" className="text-sm" />
                          Extracted Data (Firecrawl)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {comp.structured_data.services?.length > 0 && (
                            <div>
                              <p className="text-xs text-neutral-500 mb-2">Services</p>
                              <div className="flex flex-wrap gap-1.5">
                                {comp.structured_data.services.map((s, i) => (
                                  <span key={i} className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-md">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {comp.structured_data.locations_served?.length > 0 && (
                            <div>
                              <p className="text-xs text-neutral-500 mb-2">Locations</p>
                              <div className="flex flex-wrap gap-1.5">
                                {comp.structured_data.locations_served.map((l, i) => (
                                  <span key={i} className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs rounded-md">
                                    {l}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {comp.structured_data.unique_selling_points?.length > 0 && (
                            <div>
                              <p className="text-xs text-neutral-500 mb-2">USPs</p>
                              <ul className="space-y-1">
                                {comp.structured_data.unique_selling_points.slice(0, 3).map((u, i) => (
                                  <li key={i} className="text-xs text-neutral-400 flex items-start gap-1.5">
                                    <Icon icon="solar:check-circle-linear" className="text-purple-400 mt-0.5 shrink-0 text-sm" />
                                    {u}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Section */}
                    {comp.insights && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Keywords */}
                          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                              Keywords
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {comp.insights.keywords?.length > 0 ? (
                                comp.insights.keywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-md"
                                  >
                                    {kw}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-neutral-600">No keywords extracted</span>
                              )}
                            </div>
                          </div>

                          {/* Tone */}
                          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                              Tone
                            </h4>
                            <p className="text-sm text-neutral-300">
                              {comp.insights.tone || "Not analyzed"}
                            </p>
                          </div>

                          {/* Geographic Focus */}
                          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                              Geographic Focus
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {comp.insights.geographic_focus?.length > 0 ? (
                                comp.insights.geographic_focus.map((area, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-md"
                                  >
                                    {area}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-neutral-600">No areas identified</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Content Gaps */}
                          <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                            <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">
                              Content Gaps (Opportunities)
                            </h4>
                            <ul className="space-y-2">
                              {comp.insights.gaps?.length > 0 ? (
                                comp.insights.gaps.map((gap, i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-neutral-300 flex items-start gap-2"
                                  >
                                    <Icon
                                      icon="solar:target-linear"
                                      className="text-red-400 mt-0.5 shrink-0"
                                    />
                                    {gap}
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-neutral-500">No gaps identified</li>
                              )}
                            </ul>
                          </div>

                          {/* Selling Points */}
                          <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-3">
                              Their Selling Points
                            </h4>
                            <ul className="space-y-2">
                              {comp.insights.selling_points?.length > 0 ? (
                                comp.insights.selling_points.map((point, i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-neutral-300 flex items-start gap-2"
                                  >
                                    <Icon
                                      icon="solar:star-linear"
                                      className="text-amber-400 mt-0.5 shrink-0"
                                    />
                                    {point}
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-neutral-500">No selling points identified</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {comp.insights._fallback && (
                          <p className="text-xs text-amber-500/70 mt-3 flex items-center gap-1">
                            <Icon icon="solar:info-circle-linear" />
                            AI analysis used fallback mode - consider refreshing for better results
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Modal */}
      {contentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-neutral-900 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Raw Content: {contentModal.name}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Use this content as context for blog post generation
                </p>
              </div>
              <button
                onClick={() => setContentModal(null)}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
              >
                <Icon icon="solar:close-circle-linear" className="text-2xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {contentModal.structured_data && (
                <div className="mb-6 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3">Structured Data</h3>
                  <pre className="text-xs text-neutral-300 whitespace-pre-wrap font-mono">
                    {JSON.stringify(contentModal.structured_data, null, 2)}
                  </pre>
                </div>
              )}
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <h3 className="text-sm font-semibold text-neutral-400 mb-3">Markdown Content</h3>
                <pre className="text-xs text-neutral-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {contentModal.content || "No content stored. Try refreshing the analysis."}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `COMPETITOR DATA:\n${JSON.stringify(contentModal.structured_data, null, 2)}\n\nCONTENT:\n${contentModal.content}`
                  );
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                <Icon icon="solar:copy-linear" />
                Copy for Blog Generation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/leads`, {
        headers: { "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY },
      });
      const data = await response.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/leads/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (response.ok) {
        setLeads(
          leads.map((lead) =>
            lead.id === id ? { ...lead, status: newStatus } : lead,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const deleteLead = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/leads/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY },
      });
      setLeads(leads.filter((lead) => lead.id !== id));
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <div className="px-6 py-6 shrink-0">
        <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">
          Leads & Inquiries
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage contact form submissions
        </p>
      </div>

      <div className="flex-1 px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Icon
              icon="solar:refresh-bold-duotone"
              className="text-4xl text-neutral-600 animate-spin"
            />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            No leads found yet.
          </div>
        ) : (
          <div className="grid gap-4 animate-slide-up">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-neutral-800/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-200">
                        {lead.name}
                      </h3>
                      {lead.status === "new" && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          New
                        </span>
                      )}
                      {lead.status === "contacted" && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                          Contacted
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-neutral-400 space-y-1">
                      <p className="flex items-center gap-2">
                        <Icon icon="solar:letter-linear" /> {lead.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Icon icon="solar:phone-linear" /> {lead.phone}
                      </p>
                      {lead.budget && (
                          <p className="flex items-center gap-2 text-emerald-400">
                            <Icon icon="solar:wallet-linear" /> Budget: {lead.budget}
                          </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-neutral-600 font-mono">
                      {formatDate(lead.created_at)}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <a
                        href={`mailto:${lead.email}?subject=Re: Your Inquiry to High Surf Corp`}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-300 transition-colors"
                        title="Reply via Email"
                      >
                        <Icon
                          icon="solar:plain-bold-duotone"
                          className="text-xl"
                        />
                      </a>
                      <button
                        onClick={() =>
                          updateStatus(
                            lead.id,
                            lead.status === "new" ? "contacted" : "new",
                          )
                        }
                        className={`p-2 rounded-xl transition-colors ${
                          lead.status === "contacted"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-white/5 hover:bg-white/10 text-neutral-300"
                        }`}
                        title="Toggle Status"
                      >
                        <Icon
                          icon="solar:check-circle-bold-duotone"
                          className="text-xl"
                        />
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-neutral-300 transition-colors"
                        title="Delete Lead"
                      >
                        <Icon
                          icon="solar:trash-bin-trash-linear"
                          className="text-xl"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                {lead.message && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {lead.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

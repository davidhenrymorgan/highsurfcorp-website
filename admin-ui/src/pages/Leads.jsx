import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ReplyModal from "../components/ReplyModal";

export default function Leads() {
  // Tab state
  const [activeTab, setActiveTab] = useState("leads");

  // Leads state
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  // Emails state
  const [emails, setEmails] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState(null);

  useEffect(() => {
    fetchLeads();
    fetchEmails();
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
      setIsLoadingLeads(false);
    }
  };

  const fetchEmails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/emails`, {
        headers: { "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY },
      });
      const data = await response.json();
      if (data.success) {
        setEmails(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const updateLeadStatus = async (id, newStatus) => {
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

  const updateEmailStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/emails/${id}`,
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
        setEmails(
          emails.map((email) =>
            email.id === id ? { ...email, status: newStatus } : email,
          ),
        );
        // Update unread count
        if (newStatus === "read" || newStatus === "replied") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else if (newStatus === "unread") {
          setUnreadCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Failed to update email status:", error);
    }
  };

  const handleEmailClick = (email) => {
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(null);
    } else {
      setSelectedEmail(email);
      // Mark as read when opened
      if (email.status === "unread") {
        updateEmailStatus(email.id, "read");
      }
    }
  };

  const handleReply = (email) => {
    setReplyToEmail(email);
    setShowReplyModal(true);
  };

  const handleReplySent = () => {
    fetchEmails(); // Refresh to show updated status
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
          Manage contact form submissions and email inbox
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "leads"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 border border-transparent"
            }`}
          >
            <Icon
              icon="solar:users-group-rounded-bold"
              className="inline mr-2 text-lg align-middle"
            />
            Form Submissions
            {leads.filter((l) => l.status === "new").length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                {leads.filter((l) => l.status === "new").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("emails")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "emails"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 border border-transparent"
            }`}
          >
            <Icon
              icon="solar:letter-bold"
              className="inline mr-2 text-lg align-middle"
            />
            Email Inbox
            {unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          {activeTab === "emails" && (
            <button
              onClick={fetchEmails}
              className="ml-auto px-3 py-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 text-sm transition-colors"
              title="Refresh"
            >
              <Icon icon="solar:refresh-bold-duotone" className="text-lg" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 pb-6">
        {/* Leads Tab */}
        {activeTab === "leads" && (
          <>
            {isLoadingLeads ? (
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
                              <Icon icon="solar:wallet-linear" /> Budget:{" "}
                              {lead.budget}
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
                              updateLeadStatus(
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
          </>
        )}

        {/* Emails Tab */}
        {activeTab === "emails" && (
          <>
            {isLoadingEmails ? (
              <div className="flex justify-center py-20">
                <Icon
                  icon="solar:refresh-bold-duotone"
                  className="text-4xl text-neutral-600 animate-spin"
                />
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                <Icon
                  icon="solar:mailbox-bold-duotone"
                  className="text-6xl mb-4 opacity-50"
                />
                <p>No emails yet.</p>
                <p className="text-sm mt-2">
                  Emails sent to send.highsurfcorp.com will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 animate-slide-up">
                {emails.map((email) => (
                  <div key={email.id}>
                    {/* Email Row */}
                    <div
                      onClick={() => handleEmailClick(email)}
                      className={`bg-neutral-800/30 border rounded-2xl p-4 backdrop-blur-sm cursor-pointer transition-all ${
                        selectedEmail?.id === email.id
                          ? "border-emerald-500/30 bg-neutral-800/50"
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Unread Indicator */}
                        <div className="shrink-0">
                          {email.status === "unread" ? (
                            <Icon
                              icon="solar:circle-bold"
                              className="text-blue-400 text-sm"
                            />
                          ) : email.status === "replied" ? (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="text-emerald-400 text-sm"
                            />
                          ) : (
                            <Icon
                              icon="solar:circle-linear"
                              className="text-neutral-600 text-sm"
                            />
                          )}
                        </div>

                        {/* Email Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium truncate ${
                                email.status === "unread"
                                  ? "text-neutral-100"
                                  : "text-neutral-400"
                              }`}
                            >
                              {email.from_name || email.from_email}
                            </span>
                            {email.direction === "outbound" && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                                Sent
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm truncate ${
                              email.status === "unread"
                                ? "text-neutral-300"
                                : "text-neutral-500"
                            }`}
                          >
                            {email.subject || "(No Subject)"}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="shrink-0 text-xs text-neutral-600 font-mono">
                          {formatDate(email.created_at)}
                        </div>

                        {/* Expand Icon */}
                        <Icon
                          icon={
                            selectedEmail?.id === email.id
                              ? "solar:alt-arrow-up-linear"
                              : "solar:alt-arrow-down-linear"
                          }
                          className="text-neutral-500 text-lg shrink-0"
                        />
                      </div>
                    </div>

                    {/* Expanded Email Content */}
                    {selectedEmail?.id === email.id && (
                      <div className="mt-2 bg-neutral-900/50 border border-white/5 rounded-2xl p-6 animate-slide-up">
                        {/* Email Header */}
                        <div className="space-y-2 mb-4 pb-4 border-b border-white/5">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-500 w-16">From:</span>
                            <span className="text-neutral-300">
                              {email.from_name
                                ? `${email.from_name} <${email.from_email}>`
                                : email.from_email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-500 w-16">To:</span>
                            <span className="text-neutral-300">
                              {email.to_email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-500 w-16">
                              Subject:
                            </span>
                            <span className="text-neutral-300">
                              {email.subject || "(No Subject)"}
                            </span>
                          </div>
                        </div>

                        {/* Email Body */}
                        <div className="text-neutral-300 text-sm leading-relaxed">
                          {email.html_body ? (
                            <div
                              className="prose prose-invert prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: email.html_body,
                              }}
                            />
                          ) : email.text_body ? (
                            <pre className="whitespace-pre-wrap font-sans">
                              {email.text_body}
                            </pre>
                          ) : (
                            <p className="text-neutral-500 italic">
                              No content available
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
                          {email.direction === "inbound" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(email);
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <Icon
                                icon="solar:reply-bold"
                                className="text-lg"
                              />
                              Reply
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateEmailStatus(
                                email.id,
                                email.status === "unread" ? "read" : "unread",
                              );
                            }}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-full text-sm transition-colors flex items-center gap-2"
                          >
                            <Icon
                              icon={
                                email.status === "unread"
                                  ? "solar:eye-bold"
                                  : "solar:eye-closed-bold"
                              }
                              className="text-lg"
                            />
                            Mark as{" "}
                            {email.status === "unread" ? "Read" : "Unread"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reply Modal */}
      <ReplyModal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReplyToEmail(null);
        }}
        email={replyToEmail}
        onSent={handleReplySent}
      />
    </div>
  );
}

import { useState } from "react";
import { Icon } from "@iconify/react";
import GenerateModal from "./GenerateModal";

const navItems = [
  { icon: "solar:widget-bold-duotone", label: "Dashboard", href: "#" },
  { icon: "solar:document-text-bold-duotone", label: "All Posts", href: "#" },
  {
    icon: "solar:pen-new-square-bold-duotone",
    label: "New Post",
    href: "#",
    active: true,
  },
  { icon: "solar:users-group-rounded-bold-duotone", label: "Leads", href: "#" },
  { icon: "solar:settings-bold-duotone", label: "Settings", href: "#" },
];

export default function Layout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="overflow-hidden flex selection:bg-purple-500/30 selection:text-purple-200 antialiased text-base text-slate-300 bg-gray-950 h-screen">
      {/* Ambient Glow */}
      <div className="fixed top-0 left-0 w-1/3 h-1/3 rounded-full blur-[120px] -z-10 pointer-events-none bg-blue-900/20" />
      <div className="fixed bottom-0 right-0 w-1/3 h-1/3 bg-cyan-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Sidebar */}
      <aside className="flex flex-col hidden lg:flex shrink-0 w-72 h-full border-white/5 border-r">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 gap-3 text-white">
          <Icon
            icon="solar:water-sun-bold-duotone"
            className="text-2xl text-blue-400"
          />
          <span className="font-medium text-lg tracking-tight">
            High Surf Admin
          </span>
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="relative group">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3 top-2.5 text-slate-500 transition-colors group-focus-within:text-blue-400"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 transition-all placeholder-slate-600 text-slate-300 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
            <div className="absolute right-3 top-2.5 text-xs text-slate-600 border border-white/10 px-1.5 rounded">
              ⌘K
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto pr-3 pl-3 space-y-0.5">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors group ${
                item.active
                  ? "bg-blue-500/10 text-blue-200"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              <Icon
                icon={item.icon}
                className={`text-xl ${
                  item.active
                    ? "text-blue-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* User/Logout */}
        <div className="p-4 border-t border-white/5">
          <a
            href="#"
            className="flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Icon icon="solar:logout-2-bold-duotone" className="text-xl" />
            <span className="text-sm font-medium">Log out</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 glass z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button className="lg:hidden text-slate-400">
              <Icon icon="solar:hamburger-menu-linear" className="text-2xl" />
            </button>
            <div className="w-px h-6 bg-white/10 hidden lg:block" />
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="hover:text-slate-200 cursor-pointer">
                Dashboard
              </span>
              <Icon
                icon="solar:alt-arrow-right-linear"
                className="text-slate-600 text-xs"
              />
              <span className="text-slate-200 font-medium">
                Blog Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">TODAY</div>
                <div className="text-sm font-medium text-slate-200">
                  Jan 02, 2026
                </div>
              </div>
            </div>

            <div className="flex -space-x-2">
              <img
                src="https://i.pravatar.cc/150?u=1"
                className="w-8 h-8 rounded-full border-2 border-surface"
                alt=""
              />
              <img
                src="https://i.pravatar.cc/150?u=2"
                className="w-8 h-8 rounded-full border-2 border-surface"
                alt=""
              />
            </div>

            {/* AI Generate Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 shadow-lg bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
            >
              <Icon
                icon="solar:magic-stick-3-bold-duotone"
                className="text-lg"
              />
              <span>Generate with AI</span>
            </button>

            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3 text-slate-400">
              <button className="hover:text-white transition-colors">
                <Icon icon="solar:bell-bold-duotone" className="text-xl" />
              </button>
              <img
                src="https://i.pravatar.cc/150?u=8"
                className="w-8 h-8 rounded-full border border-white/10"
                alt="Profile"
              />
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 flex overflow-hidden relative">{children}</div>
      </main>

      {/* Generate Modal */}
      <GenerateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

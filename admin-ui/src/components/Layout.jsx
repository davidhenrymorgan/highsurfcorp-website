import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import GenerateModal from "./GenerateModal";

const navItems = [
  { icon: "solar:widget-bold-duotone", label: "Dashboard", href: "/" },
  {
    icon: "solar:radar-2-bold-duotone",
    label: "Intelligence",
    href: "/intelligence",
  },
  { icon: "solar:document-text-bold-duotone", label: "All Posts", href: "/" },
  {
    icon: "solar:pen-new-square-bold-duotone",
    label: "New Post",
    href: "/edit/new",
  },
  { icon: "solar:users-group-rounded-bold-duotone", label: "Leads", href: "#" },
  { icon: "solar:settings-bold-duotone", label: "Settings", href: "#" },
];

export default function Layout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="overflow-hidden flex selection:bg-emerald-500/30 selection:text-emerald-200 antialiased text-base text-neutral-400 bg-neutral-950 h-screen">
      {/* Ambient Glow */}
      <div className="fixed top-0 left-0 w-1/3 h-1/3 rounded-full blur-[120px] -z-10 pointer-events-none bg-emerald-900/10" />
      <div className="fixed bottom-0 right-0 w-1/3 h-1/3 bg-neutral-800/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Sidebar */}
      <aside className="flex flex-col hidden lg:flex shrink-0 w-72 h-full border-white/5 border-r">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 gap-3 text-neutral-50">
          <Icon
            icon="solar:water-sun-bold-duotone"
            className="text-2xl text-emerald-400"
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
              className="absolute left-3 top-2.5 text-neutral-500 transition-colors group-focus-within:text-emerald-400"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 transition-all placeholder-neutral-600 text-neutral-300 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
            <div className="absolute right-3 top-2.5 text-xs text-neutral-600 border border-white/10 px-1.5 rounded-full">
              ⌘K
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto pr-3 pl-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href !== "#" && location.pathname === item.href;
            const isHashLink = item.href.startsWith("#");

            if (isHashLink) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full transition-all group backdrop-blur-xl text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
                >
                  <Icon
                    icon={item.icon}
                    className="text-xl text-neutral-500 group-hover:text-neutral-300"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all group backdrop-blur-xl ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
                }`}
              >
                <Icon
                  icon={item.icon}
                  className={`text-xl ${
                    isActive
                      ? "text-emerald-400"
                      : "text-neutral-500 group-hover:text-neutral-300"
                  }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User/Logout */}
        <div className="p-4 border-t border-white/5">
          <a
            href="#"
            className="flex items-center gap-3 text-neutral-400 hover:text-neutral-200 transition-colors px-2"
          >
            <Icon icon="solar:logout-2-bold-duotone" className="text-xl" />
            <span className="text-sm font-medium">Log out</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-950">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 glass z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button className="lg:hidden text-neutral-400">
              <Icon icon="solar:hamburger-menu-linear" className="text-2xl" />
            </button>
            <div className="w-px h-6 bg-white/10 hidden lg:block" />
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <span className="hover:text-neutral-200 cursor-pointer">
                Dashboard
              </span>
              <Icon
                icon="solar:alt-arrow-right-linear"
                className="text-neutral-600 text-xs"
              />
              <span className="text-neutral-200 font-medium">
                Blog Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-neutral-500 font-medium">
                  TODAY
                </div>
                <div className="text-sm font-medium text-neutral-200">
                  Jan 02, 2026
                </div>
              </div>
            </div>

            <div className="flex -space-x-2">
              <img
                src="https://i.pravatar.cc/150?u=1"
                className="w-8 h-8 rounded-full border-2 border-neutral-900"
                alt=""
              />
              <img
                src="https://i.pravatar.cc/150?u=2"
                className="w-8 h-8 rounded-full border-2 border-neutral-900"
                alt=""
              />
            </div>

            {/* AI Generate Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-neutral-950 text-sm font-semibold px-5 py-2 rounded-full transition-all flex items-center gap-2 shadow-lg bg-white hover:bg-neutral-200 shadow-white/10"
            >
              <Icon
                icon="solar:magic-stick-3-bold-duotone"
                className="text-lg"
              />
              <span>Generate with AI</span>
            </button>

            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3 text-neutral-400">
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

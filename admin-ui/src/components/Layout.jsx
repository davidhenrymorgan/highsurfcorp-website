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
  {
    icon: "solar:document-text-bold-duotone",
    label: "All Posts",
    href: "/posts",
  },
  {
    icon: "solar:pen-new-square-bold-duotone",
    label: "New Post",
    href: "/edit/new",
  },
  {
    icon: "solar:users-group-rounded-bold-duotone",
    label: "Leads",
    href: "/leads",
  },
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 1280 1024"
            width="36"
            height="29"
            className="w-[36px] h-[29px] text-emerald-400"
          >
            <path
              d="M889.52793,963.54244c-52.64646-.53723-99.45921-4.81069-146.39274-6.41648-30.11735-1.03034-60.22339-2.42364-90.27508-4.86938-58.23404-4.7394-115.57374-13.54139-169.94279-36.34464-34.84196-14.61321-66.00519-35.16778-94.31054-59.93326-50.11185-43.84467-91.15683-95.00661-122.39817-153.99851-22.13031-41.78797-36.06525-86.34137-43.95908-132.66898-17.71283-103.95354-.47165-200.87368,59.48288-289.11103,44.45757-65.42995,102.7728-114.93871,171.0591-153.76822,34.69939-19.73102,71.57753-32.91664,110.21223-42.21907,51.49075-12.3979,103.26317-22.47845,156.49692-21.48905,69.90399,1.29922,136.82564,15.3412,199.07293,48.42837,16.83698,8.94957,31.9905,20.30759,46.01737,33.07742,35.43421,32.25885,66.59963,68.20869,92.09568,108.90757,2.72007,4.34213,4.81287,9.08954,7.03175,13.72801.67435,1.40962,1.45227,3.19335.17727,4.64022-1.57219,1.78393-3.50697.80761-5.16716.04828-7.58506-3.46938-13.87835-8.67591-19.05013-15.13643-15.20034-18.9885-31.15343-37.21216-48.15647-54.69582-48.9225-50.30523-109.87305-73.38396-177.8093-82.03822-44.12649-5.6212-87.43492-.396-129.71052,11.44975-39.61506,11.1003-74.79197,31.58225-105.70572,58.98072-51.44864,45.59827-84.83953,102.73041-106.15858,167.44651-12.55496,38.11181-20.59707,77.23002-25.2565,117.08211-7.66017,65.51707,10.93192,122.62047,52.82228,173.29697,37.79815,45.72602,83.47697,81.4429,133.94422,111.72416,67.52264,40.51485,139.07834,71.81402,214.57243,93.9815,49.61661,14.56899,100.20186,25.11567,151.34718,32.39986,28.40991,4.04622,57.1718,5.92355,85.92685,6.45384,43.1689.79626,85.80667-3.63717,127.83368-13.70196,9.80497-2.34807,19.15311-6.06132,28.68237-9.23803,5.10022-1.7003,10.20386-3.46949,15.63124-3.74076,2.79163-.13966,5.89594-.36964,7.27459,2.8488,1.25299,2.92523-.16563,5.49196-1.94463,7.76308-3.93334,5.02147-9.53337,7.45848-15.32583,9.39946-25.9225,8.68683-51.67038,17.97868-77.87202,25.7283-35.84209,10.60134-70.86689,23.76153-107.29311,32.59394-45.65143,11.06943-91.72144,17.62352-138.68989,18.06522-13.30878.1251-26.58521,1.76465-34.26271,1.32578Z"
              fill="currentColor"
            />
            <path
              d="M16.28316,802.63361c1.90842-29.55209,11.1553-57.34348,20.12905-85.15522,18.41082-57.05965,41.30256-112.35522,66.59847-166.65638,24.48598-52.56248,49.29555-104.97411,74.0444-157.41351,16.86311-35.7307,33.86549-71.39552,50.80772-107.08878,2.30823-4.86296,4.54826-9.80211,8.01536-13.95524,2.11013-2.52762,4.14062-6.94236,8.22992-4.56178,4.11361,2.39476,1.44747,6.29858.04389,9.35703-3.60744,7.86063-7.81583,15.4625-11.11217,23.44576-22.74684,55.08952-46.40318,109.77075-60.4158,168.11154-19.17303,79.8261-10.4903,156.77144,23.02918,230.78363,48.19681,106.42036,127.51613,182.51452,232.14147,232.92845,11.37682,5.48185,23.34748,9.50082,35.46803,13.10535,4.51515,1.34274,10.58987,2.70862,9.81264,9.04953-.70953,5.78911-6.5643,5.7251-11.11292,6.53352-7.00997,1.24584-13.96241-.46954-20.96463-.46423-52.5746.03941-105.14938-.2238-157.72404-.20958-36.44205.00985-72.18444-6.26739-107.67079-13.20517-40.71678-7.96041-78.91344-23.21633-112.40694-48.34939-29.12122-21.85199-45.2696-51.08945-46.8966-87.85908-.12362-2.79353-.01625-5.59743-.01625-8.39645Z"
              fill="currentColor"
            />
          </svg>
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

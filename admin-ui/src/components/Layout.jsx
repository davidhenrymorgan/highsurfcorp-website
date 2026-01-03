import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import GenerateModal from "./GenerateModal";

const navItems = [
  { icon: "solar:widget-bold-duotone", label: "Dashboard", href: "/" },
  { icon: "solar:radar-2-bold-duotone", label: "Intelligence", href: "/intelligence" },
  { icon: "solar:document-text-bold-duotone", label: "All Posts", href: "/posts" },
  { icon: "solar:pen-new-square-bold-duotone", label: "New Post", href: "/edit/new" },
  { icon: "solar:users-group-rounded-bold-duotone", label: "Leads", href: "/leads" },
  { icon: "solar:settings-bold-duotone", label: "Settings", href: "#" },
];

export default function Layout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-950 text-gray-400 overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Ambient Effects */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-emerald-900/10 pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-indigo-900/10 pointer-events-none translate-x-1/2 translate-y-1/2 z-0" />

      {/* --- Desktop Sidebar --- */}
      <aside 
        className={`hidden lg:flex flex-col border-r border-white/5 bg-gray-900/40 backdrop-blur-xl transition-all duration-300 z-20 
          ${isSidebarCollapsed ? "w-20" : "w-72"}`}
      >
        {/* Logo Area */}
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? "justify-center" : "px-6 gap-3"}`}>
          <div className="relative flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1280 1024"
              className="w-8 h-8 text-emerald-400 shrink-0"
              fill="currentColor"
            >
               <path d="M889.52793,963.54244c-52.64646-.53723-99.45921-4.81069-146.39274-6.41648-30.11735-1.03034-60.22339-2.42364-90.27508-4.86938-58.23404-4.7394-115.57374-13.54139-169.94279-36.34464-34.84196-14.61321-66.00519-35.16778-94.31054-59.93326-50.11185-43.84467-91.15683-95.00661-122.39817-153.99851-22.13031-41.78797-36.06525-86.34137-43.95908-132.66898-17.71283-103.95354-.47165-200.87368,59.48288-289.11103,44.45757-65.42995,102.7728-114.93871,171.0591-153.76822,34.69939-19.73102,71.57753-32.91664,110.21223-42.21907,51.49075-12.3979,103.26317-22.47845,156.49692-21.48905,69.90399,1.29922,136.82564,15.3412,199.07293,48.42837,16.83698,8.94957,31.9905,20.30759,46.01737,33.07742,35.43421,32.25885,66.59963,68.20869,92.09568,108.90757,2.72007,4.34213,4.81287,9.08954,7.03175,13.72801.67435,1.40962,1.45227,3.19335.17727,4.64022-1.57219,1.78393-3.50697.80761-5.16716.04828-7.58506-3.46938-13.87835-8.67591-19.05013-15.13643-15.20034-18.9885-31.15343-37.21216-48.15647-54.69582-48.9225-50.30523-109.87305-73.38396-177.8093-82.03822-44.12649-5.6212-87.43492-.396-129.71052,11.44975-39.61506,11.1003-74.79197,31.58225-105.70572,58.98072-51.44864,45.59827-84.83953,102.73041-106.15858,167.44651-12.55496,38.11181-20.59707,77.23002-25.2565,117.08211-7.66017,65.51707,10.93192,122.62047,52.82228,173.29697,37.79815,45.72602,83.47697,81.4429,133.94422,111.72416,67.52264,40.51485,139.07834,71.81402,214.57243,93.9815,49.61661,14.56899,100.20186,25.11567,151.34718,32.39986,28.40991,4.04622,57.1718,5.92355,85.92685,6.45384,43.1689.79626,85.80667-3.63717,127.83368-13.70196,9.80497-2.34807,19.15311-6.06132,28.68237-9.23803,5.10022-1.7003,10.20386-3.46949,15.63124-3.74076,2.79163-.13966,5.89594-.36964,7.27459,2.8488,1.25299,2.92523-.16563,5.49196-1.94463,7.76308-3.93334,5.02147-9.53337,7.45848-15.32583,9.39946-25.9225,8.68683-51.67038,17.97868-77.87202,25.7283-35.84209,10.60134-70.86689,23.76153-107.29311,32.59394-45.65143,11.06943-91.72144,17.62352-138.68989,18.06522-13.30878.1251-26.58521,1.76..."/>
            </svg>
          </div>
          {!isSidebarCollapsed && (
            <span className="font-semibold text-gray-100 text-lg tracking-tight animate-fade-in whitespace-nowrap">
              High Surf
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
           {/* Search Button (Collapsed) or Input (Expanded) */}
           <div className="mb-6 px-1">
             {isSidebarCollapsed ? (
                <button className="w-full flex justify-center p-2 text-gray-500 hover:text-emerald-400 hover:bg-white/5 rounded-xl transition-colors">
                    <Icon icon="solar:magnifer-linear" className="text-xl" />
                </button>
             ) : (
                <div className="relative group">
                    <Icon icon="solar:magnifer-linear" className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 pl-10 pr-3 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-gray-600"
                    />
                    <div className="absolute right-3 top-2.5 text-[10px] text-gray-600 border border-white/10 px-1.5 py-0.5 rounded">⌘K</div>
                </div>
             )}
           </div>

           {navItems.map((item) => {
             const isActive = item.href !== "#" && location.pathname === item.href;
             return (
               <Link
                 key={item.label}
                 to={item.href}
                 className={`flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-3 gap-3"} py-2.5 rounded-xl transition-all duration-200 group relative
                   ${isActive ? "bg-emerald-500/10 text-emerald-400" : "text-gray-400 hover:text-gray-100 hover:bg-white/5"}`}
                 title={isSidebarCollapsed ? item.label : undefined}
               >
                 <Icon icon={item.icon} className={`text-xl shrink-0 ${isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"}`} />
                 {!isSidebarCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                 
                 {/* Active Indicator Bar */}
                 {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-500 rounded-full" />}
               </Link>
             );
           })}
        </div>

        {/* Footer / Toggle */}
        <div className="p-3 border-t border-white/5 flex flex-col gap-2">
            <button 
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3 px-3"} p-2 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors`}
            >
                <Icon icon={isSidebarCollapsed ? "solar:double-alt-arrow-right-linear" : "solar:double-alt-arrow-left-linear"} className="text-xl" />
                {!isSidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
            </button>

            <button className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3 px-3"} p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors`}>
                <Icon icon="solar:logout-2-bold-duotone" className="text-xl" />
                {!isSidebarCollapsed && <span className="text-sm font-medium">Log out</span>}
            </button>
        </div>
      </aside>

      {/* --- Mobile Sidebar (Drawer) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-gray-900 border-r border-white/10 flex flex-col h-full animate-slide-right shadow-2xl">
                 <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                    <span className="font-semibold text-white">Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                        <Icon icon="solar:close-circle-linear" className="text-2xl" />
                    </button>
                 </div>
                 <div className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                         <Link
                            key={item.label}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                         >
                            <Icon icon={item.icon} className="text-xl" />
                            <span className="font-medium">{item.label}</span>
                         </Link>
                    ))}
                 </div>
            </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-gray-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white">
                <Icon icon="solar:hamburger-menu-linear" className="text-2xl" />
            </button>
            
            <div className="hidden md:flex flex-col">
                <span className="text-xs font-semibold text-emerald-400 tracking-wider">ADMIN CONSOLE</span>
                <span className="text-sm font-medium text-gray-200">
                    {navItems.find(n => n.href === location.pathname)?.label || "Dashboard"}
                </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Date Display (Hidden on mobile) */}
             <div className="hidden lg:block text-right mr-4">
                 <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Today</div>
                 <div className="text-sm font-medium text-gray-300">
                     {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </div>
             </div>

             <button 
               onClick={() => setIsModalOpen(true)}
               className="btn-primary flex items-center gap-2"
             >
                <Icon icon="solar:magic-stick-3-bold-duotone" className="text-lg" />
                <span className="hidden sm:inline">Generate</span>
             </button>

             <div className="h-8 w-px bg-white/10 hidden sm:block" />
             
             <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Icon icon="solar:bell-bold-duotone" className="text-xl" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-gray-900" />
             </button>
             
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border border-white/20 shadow-lg shadow-emerald-500/20" />
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto relative scroll-smooth">
            {children}
        </div>
      </main>

      <GenerateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
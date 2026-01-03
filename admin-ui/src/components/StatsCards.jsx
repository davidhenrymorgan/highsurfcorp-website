import { Icon } from "@iconify/react";

export default function StatsCards({ leadsCount = 0, postsCount = 0 }) {
  const stats = [
    {
      label: "Total Revenue",
      value: "$124,500", // Mock
      change: "+12.5%",
      isPositive: true,
      icon: "solar:dollar-minimalistic-bold-duotone",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Active Leads",
      value: leadsCount.toString(),
      change: "+4", // Mock
      isPositive: true,
      icon: "solar:users-group-rounded-bold-duotone",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
    },
    {
      label: "Published Posts",
      value: postsCount.toString(),
      change: "+2", // Mock
      isPositive: true,
      icon: "solar:document-text-bold-duotone",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
    {
      label: "Site Visits (30d)",
      value: "12,450", // Mock
      change: "-2.4%",
      isPositive: false,
      icon: "solar:chart-square-bold-duotone",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glass-card p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} ring-1 ring-inset ${stat.borderColor}`}>
              <Icon icon={stat.icon} className="text-2xl" />
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stat.isPositive
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/10"
              }`}
            >
              <Icon
                icon={
                  stat.isPositive
                    ? "solar:trending-up-linear"
                    : "solar:trending-down-linear"
                }
              />
              {stat.change}
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-100 tracking-tight">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {stat.label}
            </p>
          </div>
          
          {/* Decorative gradient blob */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none ${stat.bg.replace('/10', '/30')}`} />
        </div>
      ))}
    </div>
  );
}
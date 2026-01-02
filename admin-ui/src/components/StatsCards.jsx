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
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Published Posts",
      value: postsCount.toString(),
      change: "+2", // Mock
      isPositive: true,
      icon: "solar:document-text-bold-duotone",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
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
          className="p-6 rounded-2xl border border-white/5 bg-neutral-800/30 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
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
            <h3 className="text-3xl font-bold text-neutral-100 tracking-tight">
              {stat.value}
            </h3>
            <p className="text-sm text-neutral-500 mt-1 font-medium">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

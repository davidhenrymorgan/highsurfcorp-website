import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", visits: 400, leads: 24 },
  { name: "Tue", visits: 300, leads: 13 },
  { name: "Wed", visits: 550, leads: 38 },
  { name: "Thu", visits: 450, leads: 28 },
  { name: "Fri", visits: 650, leads: 42 },
  { name: "Sat", visits: 380, leads: 20 },
  { name: "Sun", visits: 320, leads: 15 },
];

export default function AnalyticsChart() {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-neutral-800/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-neutral-100">
            Traffic Overview
          </h3>
          <p className="text-sm text-neutral-500">
            Website visits vs. New leads
          </p>
        </div>
        <select className="bg-white/5 border border-white/5 rounded-lg text-xs text-neutral-400 py-1.5 px-3 focus:outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                borderColor: "#262626",
                borderRadius: "8px",
                color: "#f5f5f5",
              }}
              itemStyle={{ color: "#d4d4d4" }}
            />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVisits)"
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLeads)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

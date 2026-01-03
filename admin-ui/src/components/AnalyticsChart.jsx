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
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            Traffic Overview
          </h3>
          <p className="text-sm text-gray-500">
            Website visits vs. New leads
          </p>
        </div>
        <select className="bg-gray-800/50 border border-white/10 rounded-xl text-xs text-gray-400 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="flex-1 min-h-[300px] w-full">
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
              stroke="#ffffff08"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(17, 24, 39, 0.8)", // gray-900/80
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                color: "#f3f4f6",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              itemStyle={{ color: "#e5e7eb", fontSize: "12px" }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVisits)"
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorLeads)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
      {/* Decorative background glow behind chart */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Traffic Overview</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Visits vs Conversions</p>
        </div>
        {/* ... selector ... */}
      </div>

      <div className="flex-1 min-h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#4b5563" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              dy={10} 
            />
            <YAxis 
              stroke="#4b5563" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              dx={-10} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                color: "#fff"
              }}
              itemStyle={{ fontSize: "12px", fontWeight: 500 }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
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

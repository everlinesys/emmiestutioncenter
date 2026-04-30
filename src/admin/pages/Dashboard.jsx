import { useEffect, useState } from "react";
import api from "../../shared/api";
import { useBranding } from "../../shared/hooks/useBranding";
import { Users, Book, IndianRupee, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function AdminDashboard() {
  const brand = useBranding();
  const primary = brand.colors?.primary || "#0f172a";

  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  const [liveClasses, setLiveClasses] = useState([]);
  const [now, setNow] = useState(new Date());

  // ⭐ LOAD REAL DATA
  useEffect(() => {
    async function load() {
      try {
        const [statsRes, chartRes, liveRes] = await Promise.all([
          api.get("/adminDashboard/dashboard"),
          api.get("/adminAnalytics/revenue"),
          api.get("/live-classes"),
        ]);

        setStats(statsRes.data);
        setChartData(chartRes.data);
        setLiveClasses(liveRes.data);
      } catch (err) {
        console.error("Analytics load error:", err);
      }
    }

    load();
  }, []);
  function getCountdown(startTime) {
    const diff = new Date(startTime) - now;

    if (diff <= 0) return "Live";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  }

  function isLive(start, end) {
    return now >= new Date(start) && now <= new Date(end);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const liveNow = liveClasses.filter(lc =>
    isLive(lc.startTime, lc.endTime)
  );

  const upcomingLives = liveClasses.filter(lc =>
    new Date(lc.startTime) > now
  );

  const endedLives = liveClasses.filter(lc =>
    new Date(lc.endTime) < now
  );

  if (!stats)
    return (
      <div className="flex h-screen items-center justify-center text-[13px] text-slate-400 font-medium tracking-tight animate-pulse">
        Syncing academy data...
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto p-6 lg:p-12 space-y-12 bg-white min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Intelligence
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Real-time performance metrics
          </p>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Portfolio"
          value={stats.courses.total}
          sub="Active Courses"
          icon={<Book size={16} />}
        />

        <StatCard
          title="Community"
          value={stats.students.total}
          sub="Active Students"
          icon={<Users size={16} />}
        />

        <StatCard
          title="Earnings"
          value={`₹${stats.revenue.total}`}
          sub="Net Revenue"
          icon={<IndianRupee size={16} />}
        />
      </div>
      {/* ===== LIVE SESSIONS ===== */}
      {liveClasses.length > 0 && (
        <div className="space-y-4">

          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Live Sessions
          </h3>

          <div className="flex flex-col md:flex-row gap-6">

            {liveNow.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-red-500 uppercase tracking-[0.2em]">
                  🔴 Live Now
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {liveNow.map((lc) => (
                    <div key={lc.id} className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                      <h4 className="font-semibold">{lc.title}</h4>
                      <p className="text-sm">{new Date(lc.startTime)}</p>

                      <button
                        onClick={() => window.open(lc.meetLink, "_blank")}
                        className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-semibold"
                      >
                        🔴 Join Class
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}{upcomingLives.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em]">
                  Upcoming Sessions
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {upcomingLives.map((lc) => (
                    <div key={lc.id} className="p-5 rounded-2xl border bg-white space-y-3">
                      <h4 className="font-semibold">{lc.title}</h4>
                      <p className="text-sm">{new Date(lc.startTime).toLocaleString()}</p>
                      <p className="text-lg font-mono text-indigo-600">
                        ⏳ {getCountdown(lc.startTime)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}{endedLives.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Past Sessions
                </h3>

                <div className="space-y-2">
                  {endedLives.slice(0, 5).map((lc) => (
                    <div
                      key={lc.id}
                      className="flex justify-between items-center text-sm text-slate-400 bg-slate-50 px-4 py-2 rounded-lg"
                    >
                      <span className="truncate">{lc.title}</span>
                      <span className="text-[11px]">
                        {new Date(lc.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      {/* ===== REAL ANALYTICS GRAPH ===== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Growth Curve
          </h3>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8 shadow-sm">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primary} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={primary} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                />

                <YAxis hide />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow:
                      "0 10px 15px -3px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />

                {/* Revenue */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={primary}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />

                {/* Students */}
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== HIGHLIGHT ===== */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest">
          Market Leader
        </h4>

        <p className="text-xl font-bold mt-2">
          {stats.courses.topCourse || "Calculating..."}
        </p>
      </div>
    </div>
  );
}

/* ===== STAT CARD ===== */

function StatCard({ title, value, sub, icon }) {
  return (
    <div className="space-y-3 px-2">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {title}
        </span>
      </div>

      <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">
        {value}
      </h3>

      <p className="text-[12px] text-slate-500 font-medium">{sub}</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../../shared/api";
import { BookOpen, Video, Users } from "lucide-react";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [now, setNow] = useState(new Date());

  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [c, live] = await Promise.all([
        api.get("/courses"),
        api.get("/live-classes"),
      ]);
      setCourses(c.data || []);
      setLiveClasses(live.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  /* ===== TIMER ===== */

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  function formatCountdown(startTime) {
    const diff = new Date(startTime) - now;
    if (diff <= 0) return "Starting...";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  }

  /* ===== SPLIT LIVE ===== */

  const liveNow = [];
  const upcoming = [];
  const ended = [];

  liveClasses.forEach((lc) => {
    const start = new Date(lc.startTime);
    const end = new Date(lc.endTime);

    if (now >= start && now <= end) {
      liveNow.push(lc);
    } else if (now < start) {
      upcoming.push(lc);
    } else {
      ended.push(lc);
    }
  });

  upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Teacher Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your classes and content
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Courses" value={courses.length} icon={<BookOpen size={16} />} />
        <StatCard title="Live Classes" value={liveClasses.length} icon={<Video size={16} />} />
        <StatCard title="Students" value="—" icon={<Users size={16} />} />
      </div>

      {/* COURSES */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest">
          Your Courses
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
              onClick={() => window.location.href = `/teacher/courses`}
            >
              {c.thumbnail ? (
                <img
                  src={API_BASE + c.thumbnail}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="h-48 bg-slate-200" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-0 p-4 text-white w-full">
                <h4 className="font-semibold text-lg">{c.title}</h4>

                <button className="mt-2 text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-lg hover:bg-white/30">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE CLASSES */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest">
          Live Classes
        </h3>

        <div className="space-y-10">

          {/* 🔴 LIVE NOW */}
          {liveNow.length > 0 && (
            <Section title="🔴 Live Now" color="text-red-500">
              {liveNow.map((lc) => (
                <LiveCard key={lc.id} lc={lc} type="live" now={now} />
              ))}
            </Section>
          )}

          {/* ⏳ UPCOMING */}
          {upcoming.length > 0 && (
            <Section title="⏳ Upcoming" color="text-indigo-600">
              {upcoming.map((lc) => (
                <LiveCard key={lc.id} lc={lc} type="upcoming" now={now} />
              ))}
            </Section>
          )}

          {/* ⚪ ENDED */}
          {ended.length > 0 && (
            <Section title="Ended" color="text-slate-400">
              {ended.map((lc) => (
                <LiveCard key={lc.id} lc={lc} type="ended" now={now} />
              ))}
            </Section>
          )}

        </div>
      </div>

    </div>
  );
}

/* ===== LIVE CARD ===== */

function LiveCard({ lc, type, now }) {
  const start = new Date(lc.startTime);

  function formatCountdown() {
    const diff = start - now;
    if (diff <= 0) return "Starting...";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  }

  return (
    <div
      className={`bg-white border rounded-2xl p-5 shadow-sm space-y-3 ${
        type === "live"
          ? "border-red-300"
          : type === "upcoming"
          ? "border-indigo-300"
          : "opacity-60"
      }`}
    >
      <p className="text-xs text-slate-400">
        {lc.course?.title || "Course"}
      </p>

      <h4 className="font-semibold text-slate-900">
        {lc.title}
      </h4>

      <p className="text-sm text-slate-500">
        {new Date(lc.startTime).toLocaleString()}
      </p>

      {type === "live" && (
        <p className="text-red-500 font-mono">🔴 Live Now</p>
      )}

      {type === "upcoming" && (
        <p className="text-indigo-600 font-mono">
          ⏳ {formatCountdown()}
        </p>
      )}

      {type === "ended" && (
        <p className="text-slate-400">Ended</p>
      )}

      {type === "live" && (
        <button
          onClick={() => window.open(lc.meetLink, "_blank")}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
        >
          Join Class
        </button>
      )}
    </div>
  );
}

/* ===== SECTION ===== */

function Section({ title, children, color }) {
  return (
    <div>
      <h4 className={`text-sm font-bold mb-4 ${color}`}>
        {title}
      </h4>
      <div className="grid md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}

/* ===== STAT CARD ===== */

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase">
        {icon} {title}
      </div>
      <div className="text-2xl font-bold text-slate-900 mt-2">
        {value}
      </div>
    </div>
  );
}
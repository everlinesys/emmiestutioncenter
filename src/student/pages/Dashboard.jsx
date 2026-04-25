import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/api";
import { getUser } from "../../shared/auth";
import { useBranding } from "../../shared/hooks/useBranding";
import { Calendar, Clock, Video, Radio } from 'lucide-react';
import { PlayCircle, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";

export default function Dashboard() {
  const user = getUser();
  const navigate = useNavigate();
  const brand = useBranding();

  const primary = brand.colors?.primary || "#059669";

  const [data, setData] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    async function load() {
      const res = await api.get("/student/dashboard");
      const liveRes = await api.get("/live-classes/student");

      setData(res.data);
      console.log("hi", res.data)
      setLiveClasses(liveRes.data);
    }
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  function isLive(start, end) {
    return now >= new Date(start) && now <= new Date(end);
  }

  function getCountdown(start) {
    const diff = new Date(start) - now;

    if (diff <= 0) return "Live";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm opacity-60">
        Loading dashboard...
      </div>
    );
  }

  // Demo chart (replace with real later)
  const chartData = [
    { day: "Mon", progress: 20 },
    { day: "Tue", progress: 40 },
    { day: "Wed", progress: 35 },
    { day: "Thu", progress: 60 },
    { day: "Fri", progress: 55 },
    { day: "Sat", progress: 80 },
    { day: "Sun", progress: 75 },
  ];
  function isEnded(end) {
    return now > new Date(end);
  }
  return (
    <div className="space-y-10 p-4 md:p-0">

      {/* ===== HERO HEADER ===== */}
      <div
        className="p-8 rounded-xl text-white shadow-xl"
        style={{ background: primary }}
      >
        <h2 className="text-2xl font-bold">
          Welcome back, {user?.name}
        </h2>
        <p className="text-sm opacity-90 mt-1">
          Let’s continue your learning journey.
        </p>
      </div>
      {/* Container: Horizontal scroll on mobile, Grid on desktop */}
      <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:pb-0">
        <OverviewCard
          label="Enrolled"
          value={data.stats.totalCourses}
          color="#6366f1"
          icon={<BookOpen size={16} />}
        />

        <OverviewCard
          label="Completed"
          value={data.stats.completedCourses}
          color="#16a34a"
          icon={<CheckCircle size={16} />}
        />

        <OverviewCard
          label="Rate"
          value={`${Math.round((data.stats.completedCourses / data.stats.totalCourses) * 100 || 0)}%`}
          color={primary}
          icon={<TrendingUp size={16} />}
        />
      </div>
      {/* ===== MY COURSES ===== */}
      <Section title="My Courses">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.courses.map((c) => (
            <div
              key={c.id}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Course Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={`${api.defaults.baseURL.replace("/api", "")}${c.thumbnail}`}
                  alt={c.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Subtle Overlay on Hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle className="text-white w-12 h-12 drop-shadow-lg" />
                </div>
                {/* Floating Category/Type Badge if needed */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-tight">
                    <BookOpen size={12} />
                    Course
                  </div>
                </div>
              </div>

              {/* Content Padding */}
              <div className="p-5 flex flex-col flex-grow">
                <h4 className="font-bold text-slate-900 leading-snug min-h-[44px] line-clamp-2">
                  {c.title}
                </h4>

                {/* Progress Section */}
                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-slate-500">Progress</span>
                    <span className="text-xs font-bold" style={{ color: primary }}>
                      {c.progress}%
                    </span>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${c.progress}%`,
                        background: primary,
                      }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => navigate(`/student/watch/${c.id}`)}
                  className="mt-5 w-full py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                  style={{ background: primary }}
                >
                  {c.progress > 0 ? (
                    <>Resume Learning</>
                  ) : (
                    <>Start Course</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>
      {/* ===== OVERVIEW CARDS ===== */}
      {/* ===== LIVE CLASS ===== */}
      {/* ===== LIVE CLASSES ===== */}
      {liveClasses.length > 0 && (
        <Section title="Live Sessions">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveClasses.map((lc) => {
              const live = isLive(lc.startTime, lc.endTime);
              const ended = isEnded(lc.endTime);

              const label =
                lc.group?.name ||
                lc.course?.title ||
                "General Session";

              return (
                <div
                  key={lc.id}
                  className={`relative overflow-hidden bg-white border rounded-2xl p-6 transition-all hover:shadow-md ${live
                      ? "border-red-200 ring-1 ring-red-50"
                      : "border-slate-200"
                    }`}
                >
                  {/* LIVE DOT */}
                  {live && (
                    <span className="absolute top-4 right-4 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}

                  <div className="space-y-4">

                    {/* HEADER */}
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-md">
                        <Video size={14} className="text-slate-600" />
                      </div>

                      <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
                        {label}
                      </p>
                    </div>

                    {/* TITLE */}
                    <h4 className="font-bold text-slate-900 leading-tight">
                      {lc.title}
                    </h4>

                    {/* TIME */}
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar size={14} />
                      {new Date(lc.startTime).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                      <span>•</span>
                      <Clock size={14} />
                      {new Date(lc.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* STATUS */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${live
                          ? "bg-red-50 text-red-700"
                          : ended
                            ? "bg-slate-100 text-slate-500"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                    >
                      {live && <Radio size={16} className="animate-pulse" />}
                      {!live && <Clock size={16} />}

                      <span className="font-mono">
                        {live
                          ? "Live Now"
                          : ended
                            ? "Session Ended"
                            : getCountdown(lc.startTime)}
                      </span>
                    </div>

                    {/* BUTTON */}
                    <button
                      disabled={!live}
                      onClick={() => window.open(lc.meetLink, "_blank")}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${live
                          ? "bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      {live && <Radio size={16} />}
                      {live
                        ? "Join Session"
                        : ended
                          ? "Ended"
                          : "Starting Soon"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}


      {/* ===== ACTIVITY GRAPH ===== */}
      {/* <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4">
          Learning Activity
        </h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="progress"
                stroke={primary}
                fill={primary}
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* ===== CONTINUE LEARNING ===== */}
      {data.continueLearning?.length > 0 && (
        <Section title="Continue Learning">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {Object.values(
              data.continueLearning.reduce((acc, item) => {
                // keep first occurrence of each course
                if (!acc[item.courseId]) {
                  acc[item.courseId] = item;
                }
                return acc;
              }, {})
            ).map((item, i) => (
              <CourseCard
                key={i}
                title={item.courseTitle}
                subtitle={item.chapterTitle}
                thumbnail={item.thumbnail}
                onClick={() =>
                  navigate(`/student/watch/${item.courseId}`)
                }
                primary={primary}
                action="Resume"
              />
            ))}

          </div>
        </Section>
      )}



      {/* ===== SUGGESTED ===== */}
      {data.suggestedCourses?.length > 0 && (
        <Section title="Suggested for You">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.suggestedCourses.map((c) => (
              <CourseCard
                key={c.id}
                title={c.title}
                subtitle={`₹${c.price}`}
                onClick={() => navigate(`/course/${c.id}`)}
                primary={primary}
                thumbnail={c.thumbnail}
                action="View Course"
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ===== COMPONENTS ===== */

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function OverviewCard({ label, value, color }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <h3
        className="text-2xl font-bold mt-2"
        style={{ color }}
      >
        {value}
      </h3>
    </div>
  );
}
function CourseCard({
  title,
  subtitle,
  thumbnail,
  onClick,
  primary,
  action,
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 group"
    >
      {/* IMAGE */}
      <div className="h-40 w-full overflow-hidden">
        <img
          src={`${api.defaults.baseURL.replace("/api", "")}${thumbnail}`}

          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mb-3">{subtitle}</p>

        <button
          className="text-sm font-semibold"
          style={{ color: primary }}
        >
          {action}
        </button>
      </div>
    </div>
  );
}
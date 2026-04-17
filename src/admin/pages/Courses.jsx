import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/api";
import { useBranding } from "../../shared/hooks/useBranding";
import { Plus, MoreVertical, Users, IndianRupee, Trash2, Edit3, Settings, X, Calendar, ClipboardCheck } from "lucide-react";


export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const brand = useBranding();
  const primary = brand.colors?.primary || "#0f172a";
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [liveForm, setLiveForm] = useState({
    title: "",
    meetInput: "",
    startTime: "",
    endTime: "",
  });
  const [showTestModal, setShowTestModal] = useState(false);
  const [nextLive, setNextLive] = useState(null);
  const [now, setNow] = useState(new Date());
  
  function openTestModal() {
    if (!active) return;

    // optional: preload existing test
    // setTestForm(active.test || {});

    navigate(`/admin/tests`);
  }
  const load = async () => {
    try {
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!active) return;

    async function loadLive() {
      try {
        const res = await api.get(`/live-classes?courseId=${active.id}`);

        const nowTime = new Date();

        const upcoming = res.data
          .filter(c => new Date(c.startTime) > nowTime)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

        setNextLive(upcoming || null);
      } catch (err) {
        console.error(err);
      }
    }

    loadLive();
  }, [active]);

  function getCountdown() {
    if (!nextLive) return null;

    const diff = new Date(nextLive.startTime) - now;

    if (diff <= 0) return "Starting...";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  }

  const deleteCourse = async (id) => {
    if (!window.confirm("Permanent delete? This cannot be undone.")) return;
    await api.delete(`/courses/${id}`);
    setActive(null);
    load();
  };

  const startLive = async (id) => {
    try {
      await api.patch(`/courses/${id}/live`, { isLive: true });

      // update modal instantly
      setActive(prev => ({ ...prev, isLive: true }));

      // refresh grid
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to start live");
    }
  };

  const stopLive = async (id) => {
    try {
      await api.patch(`/courses/${id}/live`, { isLive: false });

      setActive(prev => ({ ...prev, isLive: false }));
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to stop live");
    }
  };

  function isLiveNow() {
    if (!nextLive) return false;

    const start = new Date(nextLive.startTime);
    const end = new Date(nextLive.endTime);

    return now >= start && now <= end;
  }

  async function createLiveClass() {
    try {
      const meetId = extractMeetId(liveForm.meetInput);

      if (!meetId) {
        return alert("Enter valid Google Meet ID");
      }

      const start = new Date(liveForm.startTime);
      const end = new Date(liveForm.endTime);

      const diffMinutes = (end - start) / (1000 * 60);

      if (diffMinutes <= 0) {
        return alert("End time must be after start time");
      }

      if (diffMinutes > 60) {
        return alert("Max class duration is 60 minutes");
      }

      await api.post("/live-classes", {
        title: liveForm.title,
        meetLink: `https://meet.google.com/${meetId}`,
        startTime: liveForm.startTime,
        endTime: liveForm.endTime,
        courseId: active.id,
      });

      setShowLiveModal(false);
      setLiveForm({
        title: "",
        meetInput: "",
        startTime: "",
        endTime: "",
      });

      alert("Live class scheduled");
    } catch (err) {
      console.error(err);
      alert("Failed to create live class");
    }
  }
  function extractMeetId(input) {
    if (!input) return "";

    // if full link
    if (input.includes("meet.google.com")) {
      return input.split("/").pop();
    }

    // assume already ID
    return input.trim();
  }
  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

  return (
    <div className="min-h-screen  p-6 lg:p-12 max-w-[1400px] mx-auto space-y-10"
      style={{ background: brand.colors.primary / 40 }}>

      {/* --- MINIMALIST HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Official Courses</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Manage your educational assets and course enrollments.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/courses/new")}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-[13px] font-bold transition-transform active:scale-95 shadow-lg shadow-slate-200"
          style={{ backgroundColor: primary }}
        >
          <Plus size={16} />
          Create Course
        </button>
      </header>

      {/* --- COURSE GRID --- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => setActive(course)}
            className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            {/* Thumbnail */}
            <div className="aspect-[16/10] bg-slate-50 overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={API_BASE + course.thumbnail}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={course.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  No Thumbnail
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-[15px] leading-tight pr-6">{course.title}</h3>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users size={14} />
                  <span className="text-[12px] font-bold text-slate-700">{course.studentsCount ?? 0}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <IndianRupee size={14} />
                  <span className="text-[12px] font-bold text-slate-700">{course.price}</span>
                </div>
              </div>
            </div>

            {/* Float Badge */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur p-2 rounded-full shadow-sm border border-white">
                <MoreVertical size={16} className="text-slate-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODERN SLIDE-UP MODAL --- */}
      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[6px] transition-opacity"
            onClick={() => setActive(null)}
          />

          {/* Modal Container */}
          <div className="relative bg-white scrollbar-hide shadow-2xl w-full max-w-xl 
                    max-h-[90vh] overflow-y-auto overflow-x-hidden
                    animate-in fade-in zoom-in duration-300 scrollbar-hide tailwind-scrollbar-hide">

            {/* Close Button - Now 'Sticky' so it's always accessible */}
            <button
              onClick={() => setActive(null)}
              className="absolute top-6 right-6 z-20 p-2 bg-white/80 hover:bg-white shadow-sm backdrop-blur-md rounded-full transition-all active:scale-90"
            >
              <X size={18} className="text-slate-600" />
            </button>

            {/* Course Thumbnail */}
            <div className="aspect-video bg-slate-100 shrink-0">
              {active.thumbnail && (
                <img
                  src={API_BASE + active.thumbnail}
                  className="w-full h-full object-cover"
                  alt="Course preview"
                />
              )}
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {active.title}
                </h3>
                {/* Description now has room to breathe */}
                <p className="text-[14px] text-slate-500 mt-4 leading-relaxed whitespace-pre-line">
                  {active.description || "No description provided for this curriculum."}
                </p>
              </div>

              {/* Info Grid */}
              <div className="flex gap-4 py-6 border-y border-slate-100">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">₹{active.price}</p>
                </div>
                <div className="flex-1 border-l border-slate-100 pl-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{active.studentsCount ?? 0} Students</p>
                </div>
              </div>
              {active.isLive && (
                <div className="mt-4">
                  <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
              )} {!active.isLive && (
                <div className="mt-4">
                  <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Not Live
                  </span>
                </div>
              )}
              {nextLive && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-3">

                  <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold">
                    Next Live Session
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(nextLive.startTime).toLocaleString()}
                  </p>

                  <p className="text-lg font-mono text-indigo-600">
                    ⏳ {getCountdown()}
                  </p>

                  {/* 🔴 JOIN BUTTON */}
                  {isLiveNow() && (
                    <button
                      onClick={() => window.open(nextLive.meetLink, "_blank")}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      🔴 Join Live Class
                    </button>
                  )}

                </div>
              )}


              {/* Buttons - These stay at the bottom of the scrollable content */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLiveModal(true)}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 text-white text-[12px] font-bold transition-all">
                  <Calendar size={14} />
                  Schedule Live
                </button>
                <button
                  onClick={openTestModal}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white text-[12px] font-bold transition-all hover:scale-[1.02]">
                  <ClipboardCheck size={14} />
                  Test & Certification
                </button>
                <button
                  onClick={() => navigate(`/admin/courses/${active.id}`)}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-200 text-[12px] font-bold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <Edit3 size={14} />
                  Edit Details
                </button>

                <button
                  onClick={() => navigate(`/admin/course/${active.id}/manage`)}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-[12px] font-bold shadow-lg shadow-slate-200 transition-all"
                  style={{ backgroundColor: primary }}
                >
                  <Settings size={14} />
                  Units & Chapters
                </button>
                {active.isLive && (
                  <button disabled={1}
                    onClick={() => stopLive(active.id)}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-[12px] font-bold transition-all"
                    style={{
                      backgroundColor: "#dc2626", // red-600
                    }}
                  >
                    <Settings size={14} />
                    Stop Course
                  </button>
                )}
                {!active.isLive && (
                  <button
                    onClick={() => startLive(active.id)}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-[12px] font-bold transition-all"
                    style={{
                      backgroundColor: "#16a34a", // green-600
                    }}
                  >
                    <Settings size={14} />
                    Start Live
                  </button>
                )}
                <button
                  onClick={() => deleteCourse(active.id)}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-[12px] font-bold transition-all"
                  style={{
                    backgroundColor: "#f97316", // orange-500
                  }}
                >
                  <Trash2 size={14} />
                  Archive Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLiveModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">

          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLiveModal(false)}
          />

          {/* modal */}
          <div className="relative bg-white w-full max-w-md rounded-2xl p-6 space-y-5 shadow-xl">

            <h3 className="text-lg font-bold">Schedule Live Class</h3>

            {/* TITLE */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-500">
                Title
              </label>
              <input
                className="w-full border px-3 py-2 rounded-lg text-sm"
                value={liveForm.title}
                onChange={(e) =>
                  setLiveForm({ ...liveForm, title: e.target.value })
                }
              />
            </div>

            {/* MEET INPUT */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-500">
                Google Meet ID or Link
              </label>
              <input
                placeholder="fhg-jqka-uuf or full link"
                className="w-full border px-3 py-2 rounded-lg text-sm"
                value={liveForm.meetInput}
                onChange={(e) =>
                  setLiveForm({ ...liveForm, meetInput: e.target.value })
                }
              />
            </div>

            {/* START TIME */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-500">
                Start (MM-DD-YYYY HH:MM AM/PM)
              </label>
              <input
                type="datetime-local"
                className="w-full border px-3 py-2 rounded-lg text-sm"
                value={liveForm.startTime}
                onChange={(e) =>
                  setLiveForm({ ...liveForm, startTime: e.target.value })
                }
              />
            </div>

            {/* END TIME */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-500">
                End (Max 60 mins)
              </label>
              <input
                type="datetime-local"
                className="w-full border px-3 py-2 rounded-lg text-sm"
                value={liveForm.endTime}
                onChange={(e) =>
                  setLiveForm({ ...liveForm, endTime: e.target.value })
                }
              />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={createLiveClass}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold"
              >
                Create
              </button>

              <button
                onClick={() => setShowLiveModal(false)}
                className="flex-1 bg-slate-200 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
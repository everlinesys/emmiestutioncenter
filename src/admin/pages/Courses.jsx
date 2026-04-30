import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/api";
import { useBranding } from "../../shared/hooks/useBranding";
import {
  Plus,
  MoreVertical,
  Users,
  IndianRupee,
  Trash2,
  Edit3,
  Settings,
  X,
  Calendar,
  ClipboardCheck
} from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [upcomingLives, setUpcomingLives] = useState([]);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [liveForm, setLiveForm] = useState({
    title: "",
    meetInput: "",
    startTime: "",
    endTime: "",
  });

  const [nextLive, setNextLive] = useState(null);
  const [now, setNow] = useState(new Date());

  const navigate = useNavigate();
  const brand = useBranding();
  const primary = brand.colors?.primary || "#0f172a";
  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

  /* ================= LOAD DATA ================= */
  const load = async () => {
    try {
      const [courseRes, groupRes] = await Promise.all([
        api.get("/courses"),
        api.get("/admin/course-groups"),
      ]);
      setCourses(courseRes.data || []);
      setGroups(groupRes.data || []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= LIVE CLASS LOGIC ================= */
  useEffect(() => {
    if (!active) return;

    async function loadLive() {
      try {
        const res = await api.get(`/live-classes?courseId=${active.id}`);
        const nowTime = new Date();

        const upcoming = res.data
          .filter(c => new Date(c.startTime) > nowTime)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        setUpcomingLives(upcoming);
      } catch (err) {
        console.error(err);
      }
    }

    loadLive();
  }, [active]);

  function getCountdown(startTime) {
    const diff = new Date(startTime) - now;

    if (diff <= 0) return "Starting...";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  }

  function isLiveNow() {
    if (!nextLive) return false;
    const start = new Date(nextLive.startTime);
    const end = new Date(nextLive.endTime);
    return now >= start && now <= end;
  }

  const startLive = async (id) => {
    try {
      await api.patch(`/courses/${id}/live`, { isLive: true });
      setActive(prev => ({ ...prev, isLive: true }));
      load();
    } catch (err) {
      alert("Failed to start live");
    }
  };

  const stopLive = async (id) => {
    try {
      await api.patch(`/courses/${id}/live`, { isLive: false });
      setActive(prev => ({ ...prev, isLive: false }));
      load();
    } catch (err) {
      alert("Failed to stop live");
    }
  };

  async function createLiveClass() {
    try {
      const meetId = extractMeetId(liveForm.meetInput);
      if (!meetId) return alert("Enter valid Google Meet ID");

      const start = new Date(liveForm.startTime);
      const end = new Date(liveForm.endTime);
      const diffMinutes = (end - start) / (1000 * 60);

      if (diffMinutes <= 0) return alert("End time must be after start time");
      if (diffMinutes > 60) return alert("Max class duration is 60 minutes");

      await api.post("/live-classes", {
        title: liveForm.title,
        meetLink: `https://meet.google.com/${meetId}`,
        startTime: start.toISOString(),   // ✅ FIX
        endTime: end.toISOString(),       // ✅ FIX
        courseId: active.id,
      });

      setShowLiveModal(false);
      setLiveForm({ title: "", meetInput: "", startTime: "", endTime: "" });
      alert("Live class scheduled");
      load();
    } catch (err) {
      alert("Failed to create live class");
    }
  }

  function extractMeetId(input) {
    if (!input) return "";
    if (input.includes("meet.google.com")) return input.split("/").pop();
    return input.trim();
  }

  /* ================= GROUP LOGIC ================= */
  function toggleCourseSelect(id) {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function createCourseGroup() {
    if (!groupName || selectedCourses.length === 0) {
      return alert("Group name + courses required");
    }
    try {
      await api.post("/admin/course-groups", {
        name: groupName,
        courseIds: selectedCourses,
      });
      alert("Course group created");
      setShowGroupModal(false);
      setGroupName("");
      setSelectedCourses([]);
      load();
    } catch (err) {
      alert("Failed to create group");
    }
  }

  async function deleteGroup(id) {
    if (!confirm("Delete this group?")) return;
    try {
      await api.delete(`/admin/course-groups/${id}`);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert("Failed to delete group");
    }
  }

  /* ================= COURSE ACTIONS ================= */
  const deleteCourse = async (id) => {
    if (!window.confirm("Permanent delete? This cannot be undone.")) return;
    await api.delete(`/courses/${id}`);
    setActive(null);
    load();
  };

  async function deleteLiveClass(id) {
    if (!window.confirm("Delete this live class?")) return;

    try {
      await api.delete(`/live-classes/${id}`);
      alert("Live class deleted");

      // refresh live data
      setNextLive(null);

      // reload again
      if (active) {
        const res = await api.get(`/live-classes?courseId=${active.id}`);
        const nowTime = new Date();
        const upcoming = res.data
          .filter(c => new Date(c.startTime) > nowTime)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

        setNextLive(upcoming || null);
      }

    } catch (err) {
      alert("Failed to delete live class");
    }
  }

  const openTestModal = () => {
    if (!active) return;
    navigate(`/admin/tests`);
  };

  if (loading) return <div className="p-10 text-center">Loading assets...</div>;

  return (
    <div className="min-h-screen p-6 lg:p-12 max-w-[1400px] mx-auto space-y-10">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Official Courses</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Manage your educational assets, bundles, and live sessions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-[13px] font-bold transition-transform active:scale-95 shadow-lg"
            style={{ backgroundColor: "#6366f1" }}
          >
            <Plus size={16} />
            Create Group
          </button>
          <button
            onClick={() => navigate("/admin/courses/new")}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-[13px] font-bold transition-transform active:scale-95 shadow-lg"
            style={{ backgroundColor: primary }}
          >
            <Plus size={16} />
            Create Course
          </button>
        </div>
      </header>

      {/* COURSE GROUPS SECTION */}
      {groups.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Course Groups</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group"
              >
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-lg hover:bg-white/40 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <h3 className="font-bold text-lg">{group.name}</h3>
                <p className="text-xs opacity-80 mt-1">{group.courses?.length || 0} courses included</p>
                <div className="mt-4 space-y-1.5 border-t border-white/20 pt-4">
                  {group.courses?.slice(0, 3).map((c) => (
                    <p key={c.course.id} className="text-[11px] font-medium truncate opacity-90">
                      • {c.course.title}
                    </p>
                  ))}
                  {group.courses?.length > 3 && (
                    <p className="text-[10px] italic opacity-70">+{group.courses.length - 3} more...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COURSE GRID */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Individual Courses</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => setActive(course)}
              className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
            >
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
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur p-2 rounded-full shadow-sm border border-white">
                  <MoreVertical size={16} className="text-slate-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COURSE DETAILS MODAL */}
      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[6px]" onClick={() => setActive(null)} />
          <div className="relative bg-white shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => setActive(null)} className="absolute top-6 right-6 z-20 p-2 bg-white/80 shadow-sm rounded-full">
              <X size={18} className="text-slate-600" />
            </button>
            <div className="aspect-video bg-slate-100">
              {active.thumbnail && <img src={API_BASE + active.thumbnail} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{active.title}</h3>
                <p className="text-[14px] text-slate-500 mt-4 leading-relaxed">{active.description || "No description provided."}</p>
              </div>
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

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${active.isLive ? 'bg-green-500' : 'bg-red-500'}`}>
                  {active.isLive ? 'Live' : 'Not Live'}
                </span>
              </div>

              {upcomingLives.length > 0 && (
                <div className="space-y-4">

                  <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold">
                    Upcoming Live Sessions
                  </p>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {upcomingLives.map((live, index) => (
                      <div
                        key={live.id}
                        className={`relative p-4 rounded-xl border space-y-2 ${index === 0
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-white border-slate-200"
                          }`}
                      >

                        {/* 🗑 Delete button */}
                        <button
                          onClick={() => deleteLiveClass(live.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          <Trash2 size={12} />
                        </button>

                        {/* Title */}
                        <p className="text-sm font-semibold text-slate-900">
                          {live.title}
                        </p>

                        {/* Time */}
                        <p className="text-xs text-slate-500">
                          {new Date(live.startTime).toLocaleString()}
                        </p>

                        {/* Countdown */}
                        <p className="text-sm font-mono text-indigo-600">
                          ⏳ {getCountdown(live.startTime)}
                        </p>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowLiveModal(true)} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 text-white text-[12px] font-bold">
                  <Calendar size={14} /> Schedule Live
                </button>
                <button onClick={openTestModal} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white text-[12px] font-bold">
                  <ClipboardCheck size={14} /> Test & Cert
                </button>
                <button onClick={() => navigate(`/admin/courses/${active.id}`)} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-100 text-slate-700 text-[12px] font-bold">
                  <Edit3 size={14} /> Edit Details
                </button>
                <button onClick={() => navigate(`/admin/course/${active.id}/manage`)} className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-[12px] font-bold" style={{ backgroundColor: primary }}>
                  <Settings size={14} /> Units
                </button>
                <button onClick={() => active.isLive ? stopLive(active.id) : startLive(active.id)} className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-[12px] font-bold" style={{ backgroundColor: active.isLive ? "#dc2626" : "#16a34a" }}>
                  <Settings size={14} /> {active.isLive ? "Stop Course" : "Start Live"}
                </button>
                <button onClick={() => deleteCourse(active.id)} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 text-white text-[12px] font-bold">
                  <Trash2 size={14} /> Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowGroupModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-lg font-bold">Create Course Group</h3>
            <input placeholder="Group Name" className="w-full border px-3 py-2 rounded-lg text-sm" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-slate-400">₹{c.price}</p>
                  </div>
                  <input type="checkbox" checked={selectedCourses.includes(c.id)} onChange={() => toggleCourseSelect(c.id)} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={createCourseGroup} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold">Create</button>
              <button onClick={() => setShowGroupModal(false)} className="flex-1 bg-slate-200 py-2 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE LIVE MODAL */}
      {showLiveModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLiveModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-lg font-bold">Schedule Live Class</h3>
            <div className="space-y-4">
              <input placeholder="Session Title" className="w-full border px-3 py-2 rounded-lg text-sm" value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} />
              <input placeholder="Google Meet ID or Link" className="w-full border px-3 py-2 rounded-lg text-sm" value={liveForm.meetInput} onChange={(e) => setLiveForm({ ...liveForm, meetInput: e.target.value })} />
              <div>
                <label className="text-[10px] text-slate-500 ml-1">Start Time</label>
                <input type="datetime-local" className="w-full border px-3 py-2 rounded-lg text-sm" value={liveForm.startTime} onChange={(e) => setLiveForm({ ...liveForm, startTime: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 ml-1">End Time</label>
                <input type="datetime-local" className="w-full border px-3 py-2 rounded-lg text-sm" value={liveForm.endTime} onChange={(e) => setLiveForm({ ...liveForm, endTime: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={createLiveClass} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold">Schedule</button>
              <button onClick={() => setShowLiveModal(false)} className="flex-1 bg-slate-200 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
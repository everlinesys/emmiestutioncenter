import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/api";
import { useBranding } from "../../shared/hooks/useBranding";
import { Settings, Calendar, ClipboardCheck, X } from "lucide-react";

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const brand = useBranding();

  const [showLiveModal, setShowLiveModal] = useState(false);

  const [liveForm, setLiveForm] = useState({
    title: "",
    meetInput: "",
    date: "",
    time: "",
    duration: 30,
    startTime: "",
    endTime: "",
  });

  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= TIME OPTIONS ================= */

  function generateTimeOptions() {
    const times = [];

    for (let h = 6; h <= 22; h++) {
      ["00", "30"].forEach((m) => {
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h < 12 ? "AM" : "PM";

        times.push({
          label: `${hour12}:${m} ${ampm}`,
          value: `${h.toString().padStart(2, "0")}:${m}`,
        });
      });
    }

    return times.map((t) => (
      <option key={t.value} value={t.value}>
        {t.label}
      </option>
    ));
  }

  /* ================= BUILD IST DATE ================= */

  function buildStartDateTime() {
    if (!liveForm.date || !liveForm.time) return null;

    const [hours, minutes] = liveForm.time.split(":");

    const d = new Date(liveForm.date);
    d.setHours(Number(hours));
    d.setMinutes(Number(minutes));
    d.setSeconds(0);

    return d;
  }

  /* ================= FORMAT ================= */

  function formatDateIST(date) {
    return new Date(date).toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata",
    });
  }

  function formatTimeIST(date) {
    return new Date(date).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* ================= CREATE LIVE ================= */

  async function createLiveClass() {
    try {
      if (!liveForm.startTime || !liveForm.endTime) {
        alert("Please select date, time and duration");
        return;
      }

      const meetId = liveForm.meetInput.includes("meet.google.com")
        ? liveForm.meetInput.split("/").pop()
        : liveForm.meetInput;

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
        date: "",
        time: "",
        duration: 30,
        startTime: "",
        endTime: "",
      });

      load();
    } catch (err) {
      console.error(err);
      alert("Failed to create live class");
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-white space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Courses
        </h1>
        <p className="text-sm text-slate-500">
          Manage course content and live sessions
        </p>
      </div>

      {/* COURSES */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => setActive(course)}
            className="border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg"
          >
            <div className="aspect-[16/10] bg-slate-100">
              {course.thumbnail && (
                <img
                  src={API_BASE + course.thumbnail}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-slate-900">
                {course.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* COURSE MODAL */}
      {active && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActive(null)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-xl p-6 space-y-5">
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold">{active.title}</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  navigate(`/teacher/course/${active.id}/manage`)
                }
                className="bg-indigo-600 text-white py-2 rounded"
              >
                <Settings size={14} /> Manage Content
              </button>

              <button
                onClick={() => setShowLiveModal(true)}
                className="bg-purple-600 text-white py-2 rounded"
              >
                <Calendar size={14} /> Live Class
              </button>

              <button
                onClick={() => navigate(`/teacher/tests`)}
                className="bg-slate-800 text-white py-2 rounded"
              >
                <ClipboardCheck size={14} /> Tests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE MODAL */}
      {showLiveModal && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/40 backdrop-blur-sm">

          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-5">

            <h3 className="text-lg font-bold">
              Schedule Live Class
            </h3>

            {/* TITLE */}
            <input
              placeholder="Class title"
              className="w-full border p-3 rounded-xl"
              value={liveForm.title}
              onChange={(e) =>
                setLiveForm({ ...liveForm, title: e.target.value })
              }
            />

            {/* MEET */}
            <input
              placeholder="Meet link or ID"
              className="w-full border p-3 rounded-xl"
              value={liveForm.meetInput}
              onChange={(e) =>
                setLiveForm({ ...liveForm, meetInput: e.target.value })
              }
            />

            {/* DATE */}
            <input
              type="date"
              className="w-full border p-3 rounded-xl"
              value={liveForm.date}
              onChange={(e) =>
                setLiveForm({ ...liveForm, date: e.target.value })
              }
            />

            {/* TIME */}
            <select
              className="w-full border p-3 rounded-xl"
              value={liveForm.time}
              onChange={(e) =>
                setLiveForm({ ...liveForm, time: e.target.value })
              }
            >
              <option value="">Select time</option>
              {generateTimeOptions()}
            </select>

            {/* DURATION */}
            <div className="flex gap-2">
              {[30, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => {
                    const start = buildStartDateTime();
                    if (!start) {
                      alert("Select date & time first");
                      return;
                    }

                    const end = new Date(
                      start.getTime() + min * 60000
                    );

                    setLiveForm({
                      ...liveForm,
                      duration: min,
                      startTime: start.toISOString(),
                      endTime: end.toISOString(),
                    });
                  }}
                  className={`flex-1 py-2 rounded-xl border ${
                    liveForm.duration === min
                      ? "bg-indigo-600 text-white"
                      : ""
                  }`}
                >
                  {min === 30 ? "30 min" : "1 hour"}
                </button>
              ))}
            </div>

            {/* PREVIEW */}
            {liveForm.startTime && (
              <div className="bg-slate-50 p-3 rounded-xl text-sm">
                📅 {formatDateIST(liveForm.startTime)} <br />
                ⏰ {formatTimeIST(liveForm.startTime)} →{" "}
                {formatTimeIST(liveForm.endTime)}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                onClick={createLiveClass}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl"
              >
                Create
              </button>

              <button
                onClick={() => setShowLiveModal(false)}
                className="flex-1 bg-slate-200 py-3 rounded-xl"
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
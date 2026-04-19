import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../shared/api";
import UnitSidebar from "../components/UnitSidebar";
import UnitEditor from "../components/UnitEditor";
import AdminFinalTest from "../components/AdminFinalTest";

export default function CourseCurriculum() {
  const { id: courseId } = useParams();

  const [units, setUnits] = useState([]);
  const [course, setCourse] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null);

  // 📱 MOBILE SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🎓 ASSESSMENT PANEL STATE
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  async function load() {
    const [uRes, cRes] = await Promise.all([
      api.get(`/units?courseId=${courseId}`),
      api.get(`/courses/${courseId}`),
    ]);

    setUnits(uRes.data);
    setCourse(cRes.data);

    if (uRes.data.length > 0) {
      setActiveUnit(uRes.data[0]);
    }
  }

  useEffect(() => {
    if (courseId) load();
  }, [courseId]);

  if (!course) return null;

  return (
    <div className="flex h-screen bg-slate-950 text-white">

      {/* ================= MOBILE BACKDROP ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
          fixed lg:static z-50 h-full
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <UnitSidebar
          course={course}
          units={units}
          activeUnit={activeUnit}
          setActiveUnit={(u) => {
            setActiveUnit(u);
            setSidebarOpen(false); // auto close on mobile
          }}
          reload={load}
        />
      </div>

      {/* ================= MAIN ================= */}
      <main className="flex-1 overflow-y-auto">

        {/* ===== TOP BAR ===== */}
        <div className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">

          {/* HAMBURGER */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 bg-slate-900 rounded-lg"
          >
            ☰
          </button>

          <h2 className="text-xl font-bold">
            Curriculum Editor
          </h2>

          {/* ASSESSMENT TOGGLE */}
          {/* <button
            onClick={() => setAssessmentOpen(!assessmentOpen)}
            className="px-4 py-2 bg-indigo-600 rounded-lg text-sm"
          >
            🎓 Final Assessment
          </button> */}
        </div>

        {/* ===== CONTENT ===== */}
        <div className="p-6 max-w-5xl mx-auto space-y-10">

          {/* 🎓 COLLAPSIBLE ASSESSMENT BUILDER */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            
            {/* <button
              onClick={() => setAssessmentOpen(!assessmentOpen)}
              className="w-full flex justify-between items-center px-5 py-4 hover:bg-slate-800 transition"
            >
              <span className="font-semibold">
                Final Assessment Builder
              </span>

              <span className={`transition ${assessmentOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button> */}

            {assessmentOpen && (
              <div className="p-5 border-t border-slate-800">
                <AdminFinalTest courseId={courseId} />
              </div>
            )}
          </div>

          {/* ===== UNIT EDITOR ===== */}
          {activeUnit && (
            <UnitEditor
              unit={activeUnit}
              reload={load}
            />
          )}

        </div>
      </main>
    </div>
  );
}

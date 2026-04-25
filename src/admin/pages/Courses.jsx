import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/api";
import { useBranding } from "../../shared/hooks/useBranding";
import {
  Plus,
  Users,
  IndianRupee,
  Trash2,
} from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]); // ✅ NEW
  const [active, setActive] = useState(null);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);

  const navigate = useNavigate();
  const brand = useBranding();
  const primary = brand.colors?.primary || "#0f172a";

  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

  /* ================= LOAD ================= */

  const load = async () => {
    try {
      const [courseRes, groupRes] = await Promise.all([
        api.get("/courses"),
        api.get("/admin/course-groups"),
      ]);

      setCourses(courseRes.data || []);
      setGroups(groupRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= GROUP LOGIC ================= */

  function toggleCourseSelect(id) {
    setSelectedCourses((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
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

      load(); // refresh
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    }
  }

  async function deleteGroup(id) {
    if (!confirm("Delete this group?")) return;

    try {
      await api.delete(`/admin/course-groups/${id}`);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete group");
    }
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen p-6 lg:p-12 max-w-[1400px] mx-auto space-y-10">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Official Courses
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Manage your courses & bundles
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold"
            style={{ backgroundColor: "#6366f1" }}
          >
            <Plus size={16} />
            Create Group
          </button>

          <button
            onClick={() => navigate("/admin/courses/new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold"
            style={{ backgroundColor: primary }}
          >
            <Plus size={16} />
            Create Course
          </button>
        </div>
      </header>

      {/* ================= GROUPS ================= */}
      {groups.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Course Groups
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-5 shadow-lg relative"
              >
                {/* DELETE */}
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-lg hover:bg-white/30"
                >
                  <Trash2 size={14} />
                </button>

                <h3 className="font-bold text-lg">{group.name}</h3>

                <p className="text-xs opacity-80 mt-1">
                  {group.courses?.length || 0} courses
                </p>

                {/* PREVIEW */}
                <div className="mt-4 space-y-1 text-xs opacity-90">
                  {group.courses?.slice(0, 3).map((c) => (
                    <p key={c.course.id}>
                      • {c.course.title}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= COURSES ================= */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => setActive(course)}
            className="bg-white rounded-2xl border p-4 cursor-pointer hover:shadow-lg transition"
          >
            <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={API_BASE + course.thumbnail}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No Image
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-slate-900">
                {course.title}
              </h3>

              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users size={14} /> {course.studentsCount || 0}
                </span>

                <span className="flex items-center gap-1">
                  <IndianRupee size={14} /> {course.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= GROUP MODAL ================= */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowGroupModal(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-xl">

            <h3 className="text-lg font-bold">
              Create Course Group
            </h3>

            <input
              placeholder="Group Name"
              className="w-full border px-3 py-2 rounded-lg text-sm"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      ₹{c.price}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(c.id)}
                    onChange={() => toggleCourseSelect(c.id)}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={createCourseGroup}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm"
              >
                Create
              </button>

              <button
                onClick={() => setShowGroupModal(false)}
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
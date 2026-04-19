import { useEffect, useState } from "react";
import api from "../../shared/api";

export default function TeacherStudents() {
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/students");
      setUsers(res.data || []);
    } catch {
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  const toggle = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  /* FILTER */
  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      u.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10">

      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="border-b border-slate-800 pb-6">
          <h2 className="text-2xl font-bold text-white">
            Students
          </h2>
          <p className="text-slate-400 text-sm">
            View student progress and enrollments
          </p>
        </div>

        {/* SEARCH */}
        <input
          className="w-full bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
          placeholder="Search students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* LIST */}
        <div className="space-y-4">
          {loading && <p>Loading...</p>}

          {!loading && filtered.length === 0 && (
            <p className="text-slate-500 text-center py-10">
              No students found
            </p>
          )}

          {filtered.map((u) => (
            <div
              key={u.id}
              className="bg-slate-900 border border-slate-800 rounded-xl"
            >
              <button
                onClick={() => toggle(u.id)}
                className="w-full flex justify-between p-4"
              >
                <div>
                  <div className="font-bold text-white">
                    {u.name || "Unnamed"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {u.email}
                  </div>
                </div>

                <span>{expanded[u.id] ? "▲" : "▼"}</span>
              </button>

              {expanded[u.id] && (
                <div className="p-4 border-t border-slate-800 space-y-4">

                  {/* COURSES */}
                  <div>
                    <p className="text-xs text-slate-400 mb-2">
                      Enrolled Courses
                    </p>

                    {u.purchases?.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No courses
                      </p>
                    ) : (
                      u.purchases.map((p) => (
                        <div
                          key={p.id}
                          className="bg-slate-800 p-3 rounded mb-2"
                        >
                          <div className="flex justify-between text-sm">
                            <span>{p.course?.title}</span>
                            <span>
                              {p.finalTestPassed ? "✅ Passed" : "⏳ Ongoing"}
                            </span>
                          </div>

                          <div className="mt-2 bg-slate-700 h-1 rounded">
                            <div
                              className="bg-indigo-500 h-full"
                              style={{ width: `${p.progressPercent}%` }}
                            />
                          </div>

                          <p className="text-xs mt-1 text-slate-400">
                            {p.progressPercent}%
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
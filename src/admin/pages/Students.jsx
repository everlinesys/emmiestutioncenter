import { useEffect, useState } from "react";
import api from "../../shared/api";

export default function Students() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const [loading, setLoading] = useState(false);

  // Form States
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [assigningUser, setAssigningUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [uiModal, setUiModal] = useState({
    show: false,
    title: "",
    msg: "",
    onConfirm: null,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      // Note: adjust paths if your base API url includes /api
      const u = await api.get("/students"); 
      const c = await api.get("/courses");
      setUsers(u.data || []);
      setCourses(c.data || []);
    } catch (err) {
      showAlert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const showAlert = (title, msg) =>
    setUiModal({ show: true, title, msg, onConfirm: null });

  const showConfirm = (title, msg, fn) =>
    setUiModal({ show: true, title, msg, onConfirm: fn });

  /* ================= ACTIONS ================= */

  async function addUser(e) {
    e.preventDefault();
    if (!email) return showAlert("Required", "Email required");
    try {
      await api.post("/admin/students", { name, email });
      setName("");
      setEmail("");
      setShowAdd(false);
      load();
      showAlert("Success", "User created and credentials emailed.");
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Creation failed");
    }
  }

  async function resetPassword(userId) {
    showConfirm(
      "Reset Password",
      "This will generate a new random password and email it to the user. Continue?",
      async () => {
        try {
          await api.post(`/admin/students/${userId}/reset-password`);
          setUiModal({ show: false });
          showAlert("Success", "New password has been sent.");
        } catch (err) {
          showAlert("Error", "Failed to reset password.");
        }
      }
    );
  }

  async function toggleBlock(user) {
    const action = user.blocked ? "Unblock" : "Block";
    showConfirm(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user.email}?`,
      async () => {
        try {
          await api.post(`/admin/students/${user.id}/block`);
          load();
          setUiModal({ show: false });
        } catch (err) {
          showAlert("Error", "Action failed.");
        }
      }
    );
  }

  async function handleAssignCourse() {
    if (!assigningUser || !selectedCourse) return;
    try {
      await api.post(`/admin/students/${assigningUser.id}/assign-course`, {
        courseId: Number(selectedCourse),
      });
      setAssigningUser(null);
      setSelectedCourse("");
      load();
      showAlert("Success", "Course assigned successfully.");
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Assignment failed");
    }
  }

  /* ================= FILTERING ================= */

const filtered = users
  .filter((u) => !u.blocked) // ✅ hide blocked users
  .filter(
    (u) =>
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      u.name?.toLowerCase().includes(query.toLowerCase())
  );
  const students = filtered.filter((u) => u.purchases?.length > 0);
  const visitors = filtered.filter((u) => !u.purchases || u.purchases.length === 0);
  const list = activeTab === "students" ? students : visitors;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">User Management</h2>
            <p className="text-slate-400 mt-1">Monitor student progress and manage platform access.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            + Create New User
          </button>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex bg-slate-900/50 p-1 border border-slate-800 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "students" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Students <span className="ml-2 text-xs opacity-60">{students.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("visitors")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "visitors" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Visitors <span className="ml-2 text-xs opacity-60">{visitors.length}</span>
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <input
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-2.5 rounded-xl text-sm transition-all"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* LIST */}
        <div className="grid gap-4">
          {loading && <p className="text-center py-10 text-slate-500">Loading users...</p>}
          {!loading && list.length === 0 && (
            <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500">No users found matching your criteria.</p>
            </div>
          )}

          {list.map((u) => (
            <div key={u.id} className={`group border transition-all rounded-2xl overflow-hidden ${
              expanded[u.id] ? "bg-slate-900/80 border-slate-700 shadow-xl" : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
            }`}>
              <button
                onClick={() => toggle(u.id)}
                className="w-full flex justify-between items-center p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-slate-300">
                    {u.name?.[0] || u.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {u.name || "Unnamed User"}
                      {u.blocked && <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full border border-rose-500/20">Blocked</span>}
                    </div>
                    <div className="text-xs text-slate-100">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="hidden md:block text-right">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Enrollments</div>
                      <div className="text-sm font-medium">{u.purchases?.length || 0} Courses</div>
                   </div>
                   <span className={`text-slate-500 transition-transform duration-300 ${expanded[u.id] ? "rotate-180" : ""}`}>
                    ▼
                   </span>
                </div>
              </button>

              {expanded[u.id] && (
                <div className="px-5 pb-6 space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="h-px bg-slate-800" />
                  
                  {/* QUICK ACTIONS */}
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setAssigningUser(u)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors">
                      Assign Course
                    </button>
                    <button onClick={() => resetPassword(u.id)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors">
                      Reset Password
                    </button>
                    <button 
                      onClick={() => toggleBlock(u)} 
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        u.blocked ? "bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20" : "bg-rose-600/10 text-rose-500 hover:bg-rose-600/20"
                      }`}
                    >
                      {u.blocked ? "Unblock User" : "Block User"}
                    </button>
                  </div>

                  {/* COURSE LIST */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Active Enrollments</h4>
                    {u.purchases?.length === 0 ? (
                      <p className="text-sm text-slate-600 italic">No courses assigned yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {u.purchases.map((p) => (
                          <div key={p.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-sm font-bold text-slate-200">{p.course?.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.finalTestPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                                {p.finalTestPassed ? "PASSED" : "IN PROGRESS"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${p.progressPercent}%` }} />
                                </div>
                                <span className="text-xs font-mono text-slate-500">{p.progressPercent}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ASSIGN COURSE MODAL */}
        {assigningUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Assign Course</h3>
              <p className="text-slate-400 text-sm mb-6">Enrolling: <span className="text-indigo-400 font-medium">{assigningUser.email}</span></p>
              
              <select 
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white mb-6 outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <div className="flex gap-3">
                <button onClick={() => setAssigningUser(null)} className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button onClick={handleAssignCourse} disabled={!selectedCourse} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-colors">Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* GENERAL ALERT/CONFIRM MODAL */}
        {uiModal.show && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center">
              <h3 className="text-xl font-bold text-white mb-2">{uiModal.title}</h3>
              <p className="text-slate-400 text-sm mb-8">{uiModal.msg}</p>
              <div className="flex gap-3">
                {uiModal.onConfirm ? (
                  <>
                    <button onClick={() => setUiModal({show: false})} className="flex-1 px-4 py-2 bg-slate-800 rounded-lg font-bold">Cancel</button>
                    <button onClick={uiModal.onConfirm} className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg font-bold">Confirm</button>
                  </>
                ) : (
                  <button onClick={() => setUiModal({show: false})} className="w-full px-4 py-2 bg-indigo-600 rounded-lg font-bold">OK</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CREATE USER MODAL */}
        {showAdd && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">Create New User</h3>
                <p className="text-slate-400 text-sm">They will receive an email with login credentials.</p>
              </div>

              <form onSubmit={addUser} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="john@example.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20">Create Account</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
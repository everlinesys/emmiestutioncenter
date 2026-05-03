import { useEffect, useState } from "react";
import api from "../../shared/api";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [walletModal, setWalletModal] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [assignModal, setAssignModal] = useState(null);
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

  async function updateRate(id, rate) {
    await api.post(`/admin/teachers/${id}/rate`, {
      ratePerHour: Number(rate),
    });
  }

  async function openWallet(id) {
    try {
      const res = await api.get(`/admin/teachers/${id}/wallet`);
      setWalletData(res.data);
      setWalletModal(id);
    } catch {
      showAlert("Error", "Failed to load wallet");
    }
  }

  async function markPaid(id) {
    await api.post(`/admin/teachers/${id}/mark-paid`);
    setWalletModal(null);
    load();
  }

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/teachers");
      setTeachers(res.data || []);

      const map = {};
      (res.data || []).forEach((t) => {
        map[t.id] = t.ratePerHour || "";
      });
      setRates(map);

      const c = await api.get("/courses");
      setCourses(c.data || []);
    } catch {
      showAlert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const toggle = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const showAlert = (title, msg) =>
    setUiModal({ show: true, title, msg, onConfirm: null });

  const showConfirm = (title, msg, fn) =>
    setUiModal({ show: true, title, msg, onConfirm: fn });

  /* ================= ACTIONS ================= */

  async function addTeacher(e) {
    e.preventDefault();
    if (!email) return showAlert("Required", "Email required");

    try {
      await api.post("/admin/teachers", { name, email });
      setName("");
      setEmail("");
      setShowAdd(false);
      load();
      showAlert("Success", "Teacher created and credentials emailed.");
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Creation failed");
    }
  }

  async function resetPassword(id) {
    showConfirm("Reset Password", "Send new password?", async () => {
      try {
        await api.post(`/admin/teachers/${id}/reset-password`);
        setUiModal({ show: false });
        showAlert("Success", "Password sent.");
      } catch {
        showAlert("Error", "Failed");
      }
    });
  }

  async function toggleBlock(t) {
    showConfirm(
      t.blocked ? "Unblock" : "Block",
      `Are you sure you want to ${t.blocked ? 'unblock' : 'block'} this teacher?`,
      async () => {
        await api.post(`/admin/teachers/${t.id}/block`);
        load();
        setUiModal({ show: false });
      }
    );
  }

  async function assignCourse(teacherId) {
    if (!selectedCourse) return;

    try {
      await api.post(`/admin/teachers/${teacherId}/assign-course`, {
        courseId: Number(selectedCourse),
      });

      setAssignModal(null);
      setSelectedCourse("");
      load();
    } catch {
      showAlert("Error", "Assign failed");
    }
  }

  async function removeCourse(teacherId, courseId) {
    await api.delete(`/admin/teachers/${teacherId}/course/${courseId}`);
    load();
  }

  /* ================= FILTER ================= */

  const filtered = teachers.filter(
    (t) =>
      t.email?.toLowerCase().includes(query.toLowerCase()) ||
      t.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              Teachers
            </h2>
            <p className="text-slate-400 mt-1">Manage instructor credentials, rates, and course assignments.</p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-500 hover:bg-indigo-600 transition-colors px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
          >
            + Add Teacher
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative group">
          <input
            className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {!loading && filtered.map((t) => (
            <div
              key={t.id}
              className={`transition-all duration-200 border ${expanded[t.id] ? 'bg-white/[0.07] border-white/20' : 'bg-white/5 border-white/10'} rounded-2xl overflow-hidden`}
            >
              <button
                onClick={() => toggle(t.id)}
                className="w-full flex justify-between items-center p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {(t.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {t.name || "Unnamed Teacher"}
                      {t.blocked && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] uppercase tracking-wider font-bold rounded-full border border-red-500/20">
                          Blocked
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">{t.email}</div>
                  </div>
                </div>
                <span className={`text-slate-500 transition-transform duration-300 ${expanded[t.id] ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </span>
              </button>

              {expanded[t.id] && (
                <div className="p-6 border-t border-white/10 bg-black/20 space-y-6">
                  {/* METRICS & QUICK ACTIONS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Billing Rate</label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-[160px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={rates[t.id] ?? ""}
                            onChange={(e) =>
                              setRates((prev) => ({
                                ...prev,
                                [t.id]: e.target.value
                              }))
                            }
                            onBlur={() => updateRate(t.id, rates[t.id])}
                            className="w-full bg-white/5 border border-white/10 pl-7 pr-3 py-2 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <button
                          onClick={() => openWallet(t.id)}
                          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Wallet
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Controls</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => resetPassword(t.id)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm transition-colors border border-white/10"
                        >
                          Reset Pass
                        </button>
                        <button
                          onClick={() => toggleBlock(t)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${t.blocked
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                            }`}
                        >
                          {t.blocked ? "Unblock User" : "Block User"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COURSES SECTION */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-white italic">Assigned Courses</h4>
                      <button
                        onClick={() => setAssignModal(t.id)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                      >
                        + Assign New
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {t.teachingCourses?.length === 0 && (
                        <div className="text-xs text-slate-500 italic py-2">No courses assigned to this instructor.</div>
                      )}

                      {t.teachingCourses?.map((c) => (
                        <div key={c.id} className="flex justify-between items-center bg-black/30 px-3 py-2 rounded-lg border border-white/5 group/course">
                          <span className="text-sm text-slate-300">{c.course.title}</span>
                          <button
                            onClick={() => removeCourse(t.id, c.course.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                            title="Remove assignment"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MODALS - SHARED WRAPPER COMPONENT LOGIC */}

        {/* CREATE TEACHER MODAL */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111827] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">New Instructor</h3>
              <p className="text-slate-400 text-sm mb-6">Enter details to invite a new teacher.</p>

              <form onSubmit={addTeacher} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                  <input
                    placeholder="e.g. John Doe"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                  <input
                    placeholder="name@academy.com"
                    type="email"
                    required
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-colors"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    Create Teacher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ASSIGN COURSE MODAL */}
        {assignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111827] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl text-center">
              <div className="h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-6">Assign to Course</h3>

              <select
                className="w-full p-4 bg-slate-800 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Choose a curriculum...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <div className="flex gap-3 mt-8">
                <button
                  className="flex-1 py-3 text-slate-400 hover:text-white transition-colors font-medium"
                  onClick={() => setAssignModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all"
                  onClick={() => assignCourse(assignModal)}
                >
                  Confirm Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GENERIC UI MODAL (Alert/Confirm) */}
        {uiModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
              <h3 className="text-xl font-bold text-white">{uiModal.title}</h3>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">{uiModal.msg}</p>

              <div className="mt-8 flex gap-3">
                {uiModal.onConfirm ? (
                  <>
                    <button
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors"
                      onClick={() => setUiModal({ show: false })}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all"
                      onClick={uiModal.onConfirm}
                    >
                      Confirm
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all"
                    onClick={() => setUiModal({ show: false })}
                  >
                    Got it
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WALLET MODAL */}
        {walletModal && walletData && (
          <div className="fixed pt-20 inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#111827] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Teacher Wallet</h3>
                  <p className="text-slate-400 text-sm">Settlement Overview</p>
                </div>
                <div className="h-12 w-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" /><path d="M18 14h.01" /></svg>
                </div>
              </div>

              <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Teacher Name</span>
                  <span className="text-white font-mono">{walletData.name}</span>
                </div> <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mail Id</span>
                  <span className="text-white font-mono">{walletData.email}</span>
                </div> <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Classes</span>
                  <span className="text-white font-mono">{walletData.totalClasses}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Hours</span>
                  <span className="text-white font-mono">{walletData.totalHours.toFixed(2)}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Rate applied</span>
                  <span className="text-white font-mono">₹{walletData.rate}/hr</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-[2px]">Net Payable</span>
                  <span className="text-3xl font-black text-emerald-400">₹{walletData.payable}</span>
                </div>
              </div>
              {/* HISTORY */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">Payout History</h4>
                  <span className="text-xs text-slate-500">
                    {walletData.history?.length || 0} records
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {walletData.history?.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-4">
                      No payouts yet
                    </div>
                  )}

                  {walletData.history?.map((h) => (
                    <div
                      key={h.id}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex justify-between items-center"
                    >
                      <div className="text-xs text-slate-400">
                        <div>
                          {new Date(h.fromDate).toLocaleDateString()} →{" "}
                          {new Date(h.toDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {h.totalHours.toFixed(2)}h × ₹{h.rate}
                        </div>
                      </div>

                      <div className="text-sm font-bold text-emerald-400">
                        ₹{h.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  className="py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-colors"
                  onClick={() => setWalletModal(null)}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => markPaid(walletModal)}
                  className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
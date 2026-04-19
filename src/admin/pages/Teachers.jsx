import { useEffect, useState } from "react";
import api from "../../shared/api";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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
      const res = await api.get("/admin/teachers");
      setTeachers(res.data || []);
    } catch {
      showAlert("Error", "Failed to load teachers");
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
    showConfirm(
      "Reset Password",
      "Send new password to teacher?",
      async () => {
        try {
          await api.post(`/admin/teachers/${id}/reset-password`);
          setUiModal({ show: false });
          showAlert("Success", "Password sent.");
        } catch {
          showAlert("Error", "Failed");
        }
      }
    );
  }

  async function toggleBlock(t) {
    const action = t.blocked ? "Unblock" : "Block";

    showConfirm(
      `${action} Teacher`,
      `Are you sure you want to ${action.toLowerCase()} ${t.email}?`,
      async () => {
        try {
          await api.post(`/admin/teachers/${t.id}/block`);
          load();
          setUiModal({ show: false });
        } catch {
          showAlert("Error", "Action failed");
        }
      }
    );
  }

  /* ================= FILTER ================= */

  const filtered = teachers.filter(
    (t) =>
      t.email?.toLowerCase().includes(query.toLowerCase()) ||
      t.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Teacher Management</h2>
            <p className="text-slate-400 text-sm">Manage instructors and access</p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold"
          >
            + Add Teacher
          </button>
        </div>

        {/* SEARCH */}
        <input
          className="w-full bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
          placeholder="Search teachers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* LIST */}
        <div className="space-y-4">
          {loading && <p>Loading...</p>}

          {!loading && filtered.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl">
              
              <button
                onClick={() => toggle(t.id)}
                className="w-full flex justify-between p-4"
              >
                <div>
                  <div className="font-bold">
                    {t.name || "Unnamed"}
                    {t.blocked && <span className="ml-2 text-red-400 text-xs">Blocked</span>}
                  </div>
                  <div className="text-xs text-slate-400">{t.email}</div>
                </div>
                <span>{expanded[t.id] ? "▲" : "▼"}</span>
              </button>

              {expanded[t.id] && (
                <div className="p-4 border-t border-slate-800 flex gap-3">
                  <button
                    onClick={() => resetPassword(t.id)}
                    className="px-3 py-2 bg-slate-800 rounded"
                  >
                    Reset Password
                  </button>

                  <button
                    onClick={() => toggleBlock(t)}
                    className="px-3 py-2 bg-red-900/30 text-red-400 rounded"
                  >
                    {t.blocked ? "Unblock" : "Block"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CREATE MODAL */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Create Teacher</h3>

              <form onSubmit={addTeacher} className="space-y-3">
                <input
                  placeholder="Name"
                  className="w-full p-2 bg-slate-800 rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  placeholder="Email"
                  type="email"
                  required
                  className="w-full p-2 bg-slate-800 rounded"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAdd(false)}>
                    Cancel
                  </button>
                  <button type="submit">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ALERT MODAL */}
        {uiModal.show && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-slate-900 p-6 rounded-xl text-center">
              <h3 className="text-lg font-bold">{uiModal.title}</h3>
              <p className="text-sm mt-2">{uiModal.msg}</p>

              <div className="mt-4 flex gap-2">
                {uiModal.onConfirm ? (
                  <>
                    <button onClick={() => setUiModal({ show: false })}>Cancel</button>
                    <button onClick={uiModal.onConfirm}>Confirm</button>
                  </>
                ) : (
                  <button onClick={() => setUiModal({ show: false })}>OK</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
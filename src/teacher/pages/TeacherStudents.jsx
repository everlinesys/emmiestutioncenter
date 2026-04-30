import { useEffect, useState } from "react";
import api from "../../shared/api";

export default function TeacherStudents() {
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState({});
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupLives, setGroupLives] = useState({});
  const [liveData, setLiveData] = useState({
    title: "",
    meetLink: "",
    startTime: "",
    endTime: "",
    groupId: "",
  });

  useEffect(() => {
    load();
    loadGroups();
    loadGroupLives();
  }, []);

  /* ================= LOAD ================= */

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/teacher/dashboard/students");
      setUsers(res.data || []);
    } catch {
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  }
  async function loadGroupLives() {
    try {
      const res = await api.get("/live-classes");

      const grouped = {};

      res.data.forEach((lc) => {
        if (!lc.groupId) return;

        if (!grouped[lc.groupId]) {
          grouped[lc.groupId] = [];
        }

        grouped[lc.groupId].push(lc);
      });

      setGroupLives(grouped);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadGroups() {
    try {
      const res = await api.get("/teacher/groups");
      setGroups(res.data || []);
    } catch {
      console.log("Failed to load groups");
    }
  }
  async function deleteLive(id, groupId) {
    if (!window.confirm("Delete this live?")) return;

    try {
      await api.delete(`/live-classes/${id}`);

      setGroupLives((prev) => ({
        ...prev,
        [groupId]: prev[groupId]?.filter((l) => l.id !== id),
      }));
    } catch {
      alert("Failed to delete live");
    }
  }
  /* ================= GROUP STUDENTS ================= */

  const grouped = Object.values(
    users.reduce((acc, item) => {
      const id = item.user.id;

      if (!acc[id]) {
        acc[id] = {
          id,
          name: item.user.name,
          email: item.user.email,
          purchases: [],
        };
      }

      acc[id].purchases.push(item);
      return acc;
    }, {})
  );

  /* ================= FILTER ================= */

  const filtered = grouped.filter(
    (u) =>
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      u.name?.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  /* ================= SELECT ================= */

  const toggleSelect = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedIds = Object.keys(selected)
    .filter((id) => selected[id])
    .map(Number);

  /* ================= CREATE GROUP ================= */

  const createGroup = async () => {
    if (!groupName || selectedIds.length === 0) {
      return alert("Group name + students required");
    }

    try {
      await api.post("/teacher/groups", {
        name: groupName,
        studentIds: selectedIds,
      });

      alert("Group created");

      setGroupName("");
      setSelected({});
      loadGroups();
    } catch {
      alert("Failed to create group");
    }
  };

  /* ================= CREATE LIVE ================= */

  const createLive = async () => {
    if (!liveData.groupId) {
      return alert("Please select a group");
    }

    if (!liveData.title || !liveData.meetLink) {
      return alert("Missing fields");
    }

    try {
      const start = new Date(liveData.startTime);
      const end = new Date(liveData.endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return alert("Invalid date");
      }

      await api.post("/live-classes", {
        title: liveData.title,
        meetLink: liveData.meetLink,
        startTime: start.toISOString(),   // ✅ FIX
        endTime: end.toISOString(),       // ✅ FIX
        groupId: Number(liveData.groupId),
      });

      alert("Live scheduled");
      await loadGroupLives();
      setLiveData({
        title: "",
        meetLink: "",
        startTime: "",
        endTime: "",
        groupId: "",
      });
    } catch {
      alert("Failed to create live");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="border-b border-slate-800 pb-6">
          <h2 className="text-2xl font-bold text-white">
            My Students & Groups
          </h2>
          <p className="text-slate-400 text-sm">
            Manage students, create groups, schedule live classes
          </p>
        </div>

        {/* CREATE GROUP */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-semibold text-white">Create Group</h3>

          {/* Group Name */}
          <input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded"
          />

          {/* Search inside group */}
          <input
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm"
          />

          {/* Student list */}
          <div className="max-h-[250px] overflow-y-auto space-y-2 border border-slate-700 rounded p-2">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!selected[u.id]}
                    onChange={() => toggleSelect(u.id)}
                  />
                  <div>
                    <p className="text-sm text-white">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected count */}
          <p className="text-xs text-slate-400">
            Selected: {selectedIds.length}
          </p>

          {/* Action */}
          <button
            onClick={createGroup}
            className="bg-indigo-600 px-4 py-2 rounded text-sm w-full"
          >
            Create Group
          </button>
        </div>

        {/* CREATE LIVE */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-semibold text-white">Create Live Class</h3>

          <select
            value={liveData.groupId}
            onChange={(e) =>
              setLiveData({ ...liveData, groupId: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded"
          >
            <option value="">Select Group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.membersCount || 0})
              </option>
            ))}
          </select>

          <input
            placeholder="Title"
            value={liveData.title}
            onChange={(e) =>
              setLiveData({ ...liveData, title: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded"
          />

          <input
            placeholder="Meet Link"
            value={liveData.meetLink}
            onChange={(e) =>
              setLiveData({ ...liveData, meetLink: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded"
          />

          <input
            type="datetime-local"
            value={liveData.startTime}
            onChange={(e) =>
              setLiveData({ ...liveData, startTime: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded"
          />

          <input
            type="datetime-local"
            value={liveData.endTime}
            onChange={(e) =>
              setLiveData({ ...liveData, endTime: e.target.value })
            }
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded"
          />

          <button
            onClick={createLive}
            className="bg-green-600 px-4 py-2 rounded text-sm"
          >
            Schedule Live
          </button>
        </div>
        <div className="space-y-6">
          <h3 className="text-white font-semibold">Group Live Sessions</h3>

          {groups.map((g) => {
            const lives = groupLives[g.id] || [];

            return (
              <div
                key={g.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-semibold">
                    {g.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {lives.length} sessions
                  </span>
                </div>

                {lives.length === 0 ? (
                  <p className="text-xs text-slate-500">No live sessions</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {lives.map((live) => {
                      const now = new Date();
                      const start = new Date(live.startTime);
                      const end = new Date(live.endTime);

                      const isLive = now >= start && now <= end;
                      const isPast = now > end;

                      return (
                        <div
                          key={live.id}
                          className={`relative p-3 rounded-lg text-sm border ${isLive
                            ? "bg-red-50 border-red-200 text-black"
                            : isPast
                              ? "bg-slate-800 text-slate-400"
                              : "bg-white text-black"
                            }`}
                        >

                          {/* delete */}
                          <button
                            onClick={() => deleteLive(live.id, g.id)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>

                          <p className="font-semibold">{live.title}</p>

                          <p className="text-xs">
                            {new Date(live.startTime).toLocaleString()}
                          </p>

                          {isLive && (
                            <span className="text-red-500 text-xs font-bold">
                              🔴 Live Now
                            </span>
                          )}

                          {isPast && (
                            <span className="text-xs">Ended</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* SEARCH */}


        {/* STUDENTS */}


      </div>
    </div>
  );
}
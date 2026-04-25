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

  async function loadGroups() {
    try {
      const res = await api.get("/teacher/groups");
      setGroups(res.data || []);
    } catch {
      console.log("Failed to load groups");
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
      await api.post("/live-classes", {
        title: liveData.title,
        meetLink: liveData.meetLink,
        startTime: liveData.startTime,
        endTime: liveData.endTime,
        groupId: Number(liveData.groupId),
      });

      alert("Live scheduled");

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

          <input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded"
          />

          <p className="text-xs text-slate-400">
            Selected Students: {selectedIds.length}
          </p>

          <button
            onClick={createGroup}
            className="bg-indigo-600 px-4 py-2 rounded text-sm"
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

        {/* SEARCH */}
        <input
          className="w-full bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
          placeholder="Search students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* STUDENTS */}
        <div className="space-y-4">
          {loading && <p>Loading...</p>}

          {filtered.map((u) => (
            <div
              key={u.id}
              className="bg-slate-900 border border-slate-800 rounded-xl"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!selected[u.id]}
                    onChange={() => toggleSelect(u.id)}
                  />

                  <div>
                    <div className="font-bold text-white">
                      {u.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {u.email}
                    </div>
                  </div>
                </div>

                <button onClick={() => toggle(u.id)}>
                  {expanded[u.id] ? "▲" : "▼"}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
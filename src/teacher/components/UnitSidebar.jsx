import { useState } from "react";
import api from "../../shared/api";

export default function UnitSidebar({
  course,
  units,
  activeUnit,
  setActiveUnit,
  reload,
}) {
  const [title, setTitle] = useState("");

  async function createUnit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    await api.post("/units", {
      courseId: course.id,
      title,
    });

    setTitle("");
    reload();
  }

  async function deleteUnit(id) {
    if (!confirm("Delete this unit?")) return;

    await api.delete(`/units/${id}`);
    reload();
  }

  return (
    <aside className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* ===== HEADER ===== */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-indigo-400 uppercase tracking-widest">
            Course Structure
          </span>
          <h1
            className="font-bold leading-tight line-clamp-2"
            style={{ fontSize: 20 }}
          >
            {course.title}
          </h1>
        </div>

        <div className="lg:hidden text-slate-500 text-xs">
          Units
        </div>
      </div>

      {/* ===== UNITS LIST ===== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">

        {units.length === 0 && (
          <div className="text-slate-500 text-sm text-center py-10">
            No units yet
          </div>
        )}

        {units.map((u, index) => (
          <div
            key={u.id}
            onClick={() => setActiveUnit(u)}
            className={`relative w-full text-left px-4 py-3 pr-10 rounded-lg transition group border cursor-pointer
              ${activeUnit?.id === u.id
                ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30"
                : "hover:bg-slate-800 border-transparent"
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-50">
                {index + 1}
              </span>

              <span className="font-medium truncate">
                {u.title}
              </span>
            </div>

            {/* DELETE ICON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteUnit(u.id);
              }}
              style={{background:"transparent", border:"none", color:"red"}}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                         text-slate-500 hover:text-red-400 
                         opacity-0 group-hover:opacity-100 transition"
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      {/* ===== ADD UNIT ===== */}
      <form
        onSubmit={createUnit}
        className="p-4 border-t border-slate-800 space-y-3"
      >
        <input
          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500"
          placeholder="New Unit Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg text-sm font-semibold transition"
        >
          + Add Unit
        </button>
      </form>
    </aside>
  );
}
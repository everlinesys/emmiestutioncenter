import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdMenuBook,
  MdPeople,
} from "react-icons/md";
import { ClipboardCheck } from "lucide-react";
import { useBranding } from "../../shared/hooks/useBranding";

export default function TeacherSidebar({ open, onClose }) {
  const brand = useBranding();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/teacher", icon: <MdDashboard size={20} /> },
    { name: "Courses", path: "/teacher/courses", icon: <MdMenuBook size={20} /> },
    { name: "Certifications", path: "/teacher/tests", icon: <ClipboardCheck size={18} /> },
    { name: "Students", path: "/teacher/students", icon: <MdPeople size={20} /> },
  ];

  return (
    <>
      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64
          z-50 flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{
          background: `linear-gradient(180deg, ${brand.colors.primary} 0%, #020617 100%)`,
        }}
      >
        {/* LOGO */}
        <div className="px-6 py-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-white tracking-wide">
            {brand.siteName?.toUpperCase() || "ELearn"}
          </h2>
          <p className="text-[11px] text-white/50 mt-1">
            Teacher Panel
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              end={item.path === "/teacher"}
              className={({ isActive }) =>
                `
                group flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                transition-all duration-200
                ${
                  isActive
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
              `
              }
            >
              <span className="opacity-80 group-hover:opacity-100">
                {item.icon}
              </span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM PROFILE / ACTION */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => navigate("/")}
            className="w-full text-sm bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
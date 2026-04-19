import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdMenuBook,
  MdPeople,
  MdSettings,
  MdAdd,
  MdSchool,
} from "react-icons/md";
import { useBranding } from "../../shared/hooks/useBranding";
import { useEffect, useState } from "react";
import api from "../../shared/api";
import { ClipboardCheck } from "lucide-react";

export default function AdminSidebar({ open, onClose }) {
  const brand = useBranding();
  const navigate = useNavigate();

  const [revenue, setRevenue] = useState(null);

  const menu = [
    { name: "Dashboard", path: "/admin", icon: <MdDashboard size={20} /> },
    { name: "Courses", path: "/admin/courses", icon: <MdMenuBook size={20} /> },
    { name: "Certifications", path: "/admin/tests", icon: <ClipboardCheck size={20} /> },
    { name: "Students", path: "/admin/students", icon: <MdPeople size={20} /> },
    { name: "Teachers", path: "/admin/teachers", icon: <MdSchool size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <MdSettings size={20} /> },
  ];

  // ⭐ Fetch real revenue
  useEffect(() => {
    async function loadRevenue() {
      try {
        const { data } = await api.get("/adminDashboard/dashboard");
        setRevenue(data.revenue.total);
      } catch (err) {
        console.error("Revenue fetch error:", err);
      }
    }

    loadRevenue();
  }, []);

  return (
    <>
      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64
          p-5 z-50 flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{
          background: brand.colors.primary,
          color: brand.colors.accent,
        }}
      >
        {/* LOGO */}
        <h2 className="text-xl font-bold mb-8">
          {brand.siteName?.toUpperCase() || "ELearn"}
        </h2>

        {/* MENU */}
        <nav className="space-y-2 flex-grow">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              end={item.path === "/admin"}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition"
              style={({ isActive }) => ({
                color: isActive
                  ? brand.colors.primary
                  : brand.colors.accent,
                background: isActive
                  ? brand.colors.accent
                  : "transparent",
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* ===== BOTTOM PANEL ===== */}
        <div
          className="mt-auto p-4 rounded-xl space-y-3"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          {/* Revenue */}
          <div>
            <p className="text-xs opacity-70">Revenue</p>
            <p className="text-lg font-bold">
              {revenue !== null ? `₹${revenue}` : "Loading..."}
            </p>
          </div>

          {/* Add Course Button */}
          <button
            onClick={() => navigate("/admin/courses/new")}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium"
            style={{
              background: brand.colors.accent,
              color: brand.colors.primary,
            }}
          >
            <MdAdd size={18} />
            New Course
          </button>
        </div>
      </aside>
    </>
  );
}

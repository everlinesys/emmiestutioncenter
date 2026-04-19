import { useState } from "react";
import {
  MdNotifications,
  MdSearch,
  MdPerson,
  MdLogout,
  MdMenu,
} from "react-icons/md";

import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../shared/auth";
import { useBranding } from "../../shared/hooks/useBranding";
export default function TeacherHeader({ onMenuClick }) {
  const brand = useBranding();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shadow-sm">

      {/* ⭐ LEFT SIDE */}
      <div className="flex items-center gap-3">

        {/* MOBILE HAMBURGER */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-gray-100"
           style={{ background: brand.colors.accent, borderRadius: 4, color: brand.colors.primary }}
        >
          <MdMenu size={24} />
        </button>

        <h1 className="text-sm md:text-lg font-semibold text-gray-800" style={{ fontSize: 20 }}>
          {brand.siteName?.toUpperCase() + " Teacher" || "ELearn Teacher"}
        </h1>
      </div>

      {/* ⭐ RIGHT SIDE */}
      <div className="flex items-center gap-4 md:gap-6 relative">

        {/* SEARCH */}
        {/* <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg">
          <MdSearch size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-2 text-sm"
          />
        </div> */}

        {/* NOTIFICATIONS */}
        {/* <button className="relative">
          <MdNotifications size={22} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
            3
          </span>
        </button> */}

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2"
             style={{ background: brand.colors.accent, borderRadius: 4, color: brand.colors.primary }}
          >
            <MdPerson size={22} />
            <span className="hidden sm:inline text-sm font-medium">
              {user?.name || "Admin"}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-44 bg-white border rounded-lg shadow-lg z-50 text-gray-700">
              <button
                onClick={() => navigate("/admin/profile")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
               >
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
              >
                <MdLogout size={18} />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

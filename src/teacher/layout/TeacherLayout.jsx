import { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherHeader from "./TeacherHeader";
import TeacherSidebar from "./TeacherSidebar";

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 min-w-screen">

      {/* ⭐ SIDEBAR */}
      <TeacherSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ⭐ MAIN */}
      <div className="flex-1 flex flex-col">

        <TeacherHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto text-black font-sm">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../../shared/api";
import { useBranding } from "../../shared/hooks/useBranding";
import { User, Mail, Calendar, Settings, ShieldCheck, BookOpen } from "lucide-react";

export default function StudentProfile() {
  const brand = useBranding();
  const theme = brand.theme;
  const primary = brand.colors?.primary || "#059669";

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/student/profile");
        setProfile(data);
      } catch (err) {
        console.error("Profile load error:", err);
      }
    }
    load();
  }, []);

  if (!profile) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Syncing your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto p-6 lg:p-10 space-y-8`}>

      {/* HEADER / IDENTITY SECTION */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl">
        {/* Abstract Background Glow */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-30"
          style={{ backgroundColor: primary }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar with dynamic Initial */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black shadow-inner border border-white/10"
            style={{ backgroundColor: primary }}
          >
            {profile.name?.charAt(0)}
          </div>

          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{profile.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-sm">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Verified Student Account</span>
            </div>
          </div>

          <button className="md:ml-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all">
            <Settings size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[

          {
            label: "Enrolled Courses",
            value: profile.stats.enrolledCourses,
            icon: <BookOpen />,
            color: "text-blue-500",
          },
          {
            label: "Completed",
            value: profile.stats.completedCourses,
            icon: <ShieldCheck />,
            color: "text-emerald-500",
          },
          {
            label: "Learning Points",
            value: profile.stats.learningPoints,
            icon: <Calendar />,
            color: "text-amber-500",
          },

        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* INFO GRID */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={20} style={{ color: primary }} /> Account Information
            </h3>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-4 gap-2 md:gap-0">
                <span className="w-40 text-sm font-bold text-slate-400 flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </span>
                <span className="text-sm font-semibold text-slate-700">{profile.email}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-4 gap-2 md:gap-0">
                <span className="w-40 text-sm font-bold text-slate-400 flex items-center gap-2">
                  <Calendar size={14} /> Member Since
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Mini-Card (Help/Support) */}
        <div className="space-y-6">
          <div
            className="p-8 rounded-3xl text-white space-y-4"
            style={{ backgroundColor: primary }}
          >
            <h4 className="font-bold">Need Help?</h4>
            <p className="text-xs leading-relaxed opacity-90">
              Having trouble with your account or course access? Our support team is here to help you 24/7.
            </p>
            <button className="w-full py-3 bg-white text-slate-100 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
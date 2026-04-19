import { useState } from "react";
import { useBranding } from "../../shared/hooks/useBranding";

export default function AdminSettings() {
  const brand = useBranding();
  const primary = brand.colors?.primary || "#111827";

  const [showModal, setShowModal] = useState(false);

  const restrictedAction = () => {
    setShowModal(true);
    setTimeout(() => setShowModal(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your institute preferences.
        </p>
      </div>

      {/* ===== GENERAL ===== */}
      <Section title="General">
        <SettingRow label="Institute Name" value={brand.siteName || "Eduline Academy"} />
        <SettingRow label="Support Email" value={brand.contact.email || "support@everlinesys.com"} />
        <SettingButton
          label="Change Logo"
          onClick={restrictedAction}
          primary={primary}
        />
      </Section>

      {/* ===== BRANDING ===== */}
      <Section title="Branding">
        <SettingButton
          label="Change Primary Color"
          onClick={restrictedAction}
          primary={primary}
        />
        <SettingButton
          label="Change Accent Color"
          onClick={restrictedAction}
          primary={primary}
        />
      </Section>

      {/* ===== SECURITY ===== */}
      <Section title="Security">
        <SettingButton
          label="Change Password"
          onClick={restrictedAction}
          primary={primary}
        />
        <SettingButton
          label="Logout All Sessions"
          onClick={restrictedAction}
          primary={primary}
        />
      </Section>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg text-sm">
          You are not allowed to do that. Please contact administrator.
        </div>
      )}
    </div>
  );
}

/* ===== COMPONENTS ===== */

function Section({ title, children }) {
  return (
    <div className="bg-white border rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SettingButton({ label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full py-2 text-sm font-medium hover:underline"
      style={{ color: primary }}
    >
      {label}
    </button>
  );
}

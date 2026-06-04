"use client";

import { useState } from "react";
import { User, Building2, Bell, Lock, Link as LinkIcon, Save, Loader2 } from "lucide-react";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";

const TABS = [
  { label: "Profile",       icon: User,      id: "profile" },
  { label: "Organization",  icon: Building2, id: "organization" },
  { label: "Notifications", icon: Bell,      id: "notifications" },
  { label: "Security",      icon: Lock,      id: "security" },
  { label: "Integrations",  icon: LinkIcon,  id: "integrations" },
] as const;
type TabId = typeof TABS[number]["id"];

export default function SettingsPage() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [saving, setSaving] = useState(false);

  // form state — pre-filled from context
  const [form, setForm] = useState({
    firstName:  user?.firstName  ?? "",
    lastName:   user?.lastName   ?? "",
    email:      user?.email      ?? "",
    phone:      user?.phone      ?? "",
    department: user?.department ?? "",
    bio:        user?.bio        ?? "",
  });

  function setField(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    showToast("Settings saved successfully!", "success");
    setSaving(false);
  }

  const initials = user?.avatarInitials ?? (
    user ? `${user.firstName[0]}${user.lastName[0]}` : "?"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and platform preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <aside className="w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#8B1A1A] text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content panel */}
        <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm p-6">

          {/* ── Profile tab ── */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-gray-900 text-base">Profile Settings</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update your personal information</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
                <div>
                  <button
                    onClick={() => showToast("Avatar upload coming soon!", "info")}
                    className="text-sm font-semibold text-[#8B1A1A] hover:text-[#7B1414] transition-colors">
                    Change Avatar
                  </button>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, or GIF — max 2 MB</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name",    key: "firstName" as const,  type: "text" },
                  { label: "Last Name",     key: "lastName" as const,   type: "text" },
                  { label: "Email Address", key: "email" as const,      type: "email" },
                  { label: "Phone Number",  key: "phone" as const,      type: "tel" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                      placeholder={f.label}
                      className="input-field"
                    />
                  </div>
                ))}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department</label>
                  <input type="text" value={form.department}
                    onChange={(e) => setField("department", e.target.value)}
                    className="input-field" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bio</label>
                  <textarea rows={3} value={form.bio}
                    onChange={(e) => setField("bio", e.target.value)}
                    className="input-field resize-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
                <button onClick={() => setForm({ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", email: user?.email ?? "", phone: user?.phone ?? "", department: user?.department ?? "", bio: user?.bio ?? "" })}
                  className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm shadow-[#8B1A1A]/20">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── Organization tab ── */}
          {activeTab === "organization" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-gray-900 text-base">Organization</h2>
                <p className="text-sm text-gray-500 mt-0.5">Platform and company configuration</p>
              </div>
              {[
                { label: "Organization Name", value: "Xplore Philippines Inc." },
                { label: "Domain",            value: "xplore.io" },
                { label: "Time Zone",         value: "Asia/Manila (UTC+8)" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input type="text" defaultValue={f.value} className="input-field" />
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-gray-50">
                <button onClick={() => showToast("Organization settings saved!", "success")}
                  className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                  <Save className="w-4 h-4" />Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications tab ── */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-gray-900 text-base">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mt-0.5">Control what alerts you receive</p>
              </div>
              {[
                { label: "Event reminders",               desc: "Get notified 1 hour before an event starts" },
                { label: "Meeting invitations",           desc: "Receive alerts when added to a meeting" },
                { label: "Training module updates",       desc: "Notify when new modules are published" },
                { label: "System announcements",          desc: "Platform maintenance and feature updates" },
              ].map((item, i) => (
                <div key={item.label} className="flex items-start justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => showToast("Preference updated!", "success")}
                    className={`relative w-10 h-5 rounded-full transition-all ${i < 2 ? "bg-[#8B1A1A]" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${i < 2 ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Security tab ── */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-gray-900 text-base">Security Settings</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage your password and access</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-50">
                <button onClick={() => showToast("Password updated successfully!", "success")}
                  className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                  <Lock className="w-4 h-4" />Update Password
                </button>
              </div>
            </div>
          )}

          {/* ── Integrations tab ── */}
          {activeTab === "integrations" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-gray-900 text-base">Integrations</h2>
                <p className="text-sm text-gray-500 mt-0.5">Connect third-party services to Nexus</p>
              </div>
              {[
                { name: "Jitsi Meet",  status: "Active",         logo: "J", color: "bg-emerald-600", desc: "Open-source video rooms" },
                { name: "Google Calendar", status: "Not connected", logo: "G", color: "bg-red-500", desc: "Sync events with Google Calendar" },
                { name: "Slack",       status: "Not connected",  logo: "S", color: "bg-violet-600", desc: "Notifications via Slack channels" },
              ].map((int) => (
                <div key={int.name} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${int.color} flex items-center justify-center text-white text-sm font-bold`}>
                      {int.logo}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{int.name}</p>
                      <p className="text-xs text-gray-400">{int.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      int.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {int.status}
                    </span>
                    <button onClick={() => showToast(`${int.name} integration coming soon!`, "info")}
                      className="text-xs font-semibold text-[#8B1A1A] hover:text-[#7B1414] transition-colors">
                      {int.status === "Active" ? "Configure" : "Connect"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

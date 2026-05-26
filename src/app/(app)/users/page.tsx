"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, UserPlus, Eye, Pencil, Shield,
  ToggleLeft, ToggleRight, X, Building2, Mail, Clock, ChevronDown,
} from "lucide-react";
import { MOCK_USERS } from "@/lib/data/users";
import { showToast } from "@/components/ui/Toast";
import type { User, UserRole, UserStatus } from "@/types";

const ROLES: UserRole[] = ["Admin", "Organizer", "Instructor", "Participant"];

const ROLE_COLOR: Record<UserRole, string> = {
  Admin:       "bg-red-50 text-red-700 border-red-100",
  Organizer:   "bg-blue-50 text-blue-700 border-blue-100",
  Instructor:  "bg-amber-50 text-amber-700 border-amber-100",
  Participant: "bg-gray-100 text-gray-600 border-gray-200",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

// ── User Detail Drawer ──────────────────────────────────────────────────────
function UserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-display font-bold text-gray-900">User Profile</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center text-[#8B1A1A] text-lg font-bold flex-shrink-0">
              {user.avatarInitials}
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 text-base">{user.firstName} {user.lastName}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLOR[user.role]}`}>
                {user.role === "Admin" && <Shield className="w-3 h-3" />}
                {user.role}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {[
              { Icon: Mail,      label: "Email",       value: user.email },
              { Icon: Building2, label: "Department",  value: user.department },
              { Icon: Clock,     label: "Last Active",  value: fmtDate(user.lastActive) },
              { Icon: Clock,     label: "Member Since", value: fmtDate(user.createdAt) },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-gray-400">Account Status</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.status}</p>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-gray-300"}`} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-100 space-y-2">
          <button
            onClick={() => { showToast("Edit user coming soon!", "info"); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm shadow-[#8B1A1A]/20"
          >
            <Pencil className="w-4 h-4" /> Edit User
          </button>
          <button
            onClick={() => { showToast(`${user.firstName}'s status toggled!`, "success"); onClose(); }}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {user.status === "Active" ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
            {user.status === "Active" ? "Deactivate" : "Activate"} Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([...MOCK_USERS]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || `${u.firstName} ${u.lastName} ${u.email} ${u.department}`.toLowerCase().includes(q);
      const matchRole   = roleFilter === "All" || u.role === roleFilter;
      const matchStatus = statusFilter === "All" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const activeCount   = users.filter((u) => u.status === "Active").length;
  const inactiveCount = users.filter((u) => u.status === "Inactive").length;

  function handleToggleStatus(userId: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" as UserStatus }
          : u
      )
    );
    const u = users.find((u) => u.id === userId)!;
    showToast(`${u.firstName}'s account ${u.status === "Active" ? "deactivated" : "activated"}!`, "success");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Drawer */}
      {selectedUser && (
        <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} total &middot; <span className="text-green-600 font-medium">{activeCount} active</span>
            {inactiveCount > 0 && <> &middot; <span className="text-gray-400">{inactiveCount} inactive</span></>}
          </p>
        </div>
        <button
          onClick={() => showToast("Invite User coming soon!", "info")}
          className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-[#8B1A1A]/20"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Search + filter toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-50 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]/30"
            />
          </div>

          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 text-sm font-medium border rounded-lg px-3 py-2 transition-colors ${
              showFilters || roleFilter !== "All" || statusFilter !== "All"
                ? "border-[#8B1A1A]/30 bg-red-50 text-[#8B1A1A]"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {(roleFilter !== "All" || statusFilter !== "All") && (
              <span className="w-4 h-4 flex items-center justify-center bg-[#8B1A1A] text-white text-[10px] font-bold rounded-full">
                {(roleFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0)}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {(search || roleFilter !== "All" || statusFilter !== "All") && (
            <button
              onClick={() => { setSearch(""); setRoleFilter("All"); setStatusFilter("All"); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        {showFilters && (
          <div className="flex gap-3 px-4 pb-4 pt-1 border-b border-gray-50 flex-wrap">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "All")}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20"
              >
                <option value="All">All Roles</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UserStatus | "All")}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-gray-400">No users match your filters</p>
              <button onClick={() => { setSearch(""); setRoleFilter("All"); setStatusFilter("All"); }} className="text-xs text-[#8B1A1A] mt-1 hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Name", "Email", "Department", "Role", "Status", "Last Active", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center text-[#8B1A1A] text-xs font-bold flex-shrink-0">
                          {u.avatarInitials}
                        </div>
                        <span className="font-medium text-gray-900">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.email}</td>
                    <td className="px-5 py-4 text-gray-500">{u.department}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLOR[u.role]}`}>
                        {u.role === "Admin" && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={u.status === "Active" ? "badge-upcoming" : "badge-completed"}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{fmtDate(u.lastActive)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          title="View details"
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => showToast("Edit user coming soon!", "info")}
                          title="Edit user"
                          className="p-1.5 text-gray-400 hover:text-[#8B1A1A] hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          title={u.status === "Active" ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-md transition-colors ${
                            u.status === "Active"
                              ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                              : "text-green-500 hover:text-green-700 hover:bg-green-50"
                          }`}
                        >
                          {u.status === "Active" ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/utils";
import {
  Security,
  Add,
  CheckCircle,
  Delete,
  Edit,
  Refresh,
  Lock,
  Layers
} from "@mui/icons-material";

export default function RolePermissionMatrix() {
  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [verticals, setVerticals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    accountType: "Operations Manager",
    description: "",
    permissions: [],
    allowedVerticals: ["all"],
    allowedCities: ["Indore"]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [catRes, rolesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/admin/roles-permissions/permissions-catalog`, { headers }),
        axios.get(`${API_BASE_URL}/api/v1/admin/roles-permissions/roles`, { headers })
      ]);

      if (catRes.data?.success) {
        setCatalog(catRes.data.data.catalog || []);
        setVerticals(catRes.data.data.verticals || []);
      }
      if (rolesRes.data?.success) {
        setRoles(rolesRes.data.data || []);
        if (rolesRes.data.data.length > 0 && !selectedRole) {
          selectRoleForEdit(rolesRes.data.data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading RBAC matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectRoleForEdit = (role) => {
    setSelectedRole(role);
    setIsEditing(true);
    setFormData({
      name: role.name,
      accountType: role.accountType || "Admin",
      description: role.description || "",
      permissions: role.permissions || [],
      allowedVerticals: role.allowedVerticals || ["all"],
      allowedCities: role.allowedCities || ["Indore"]
    });
  };

  const handleNewRole = () => {
    setSelectedRole(null);
    setIsEditing(false);
    setFormData({
      name: "",
      accountType: "Operations Manager",
      description: "",
      permissions: [],
      allowedVerticals: ["all"],
      allowedCities: ["Indore"]
    });
  };

  const togglePermission = (permId) => {
    const current = [...formData.permissions];
    const index = current.indexOf(permId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(permId);
    }
    setFormData({ ...formData, permissions: current });
  };

  const toggleVertical = (vert) => {
    let current = [...formData.allowedVerticals];
    if (vert === 'all') {
      current = current.includes('all') ? [] : ['all'];
    } else {
      current = current.filter(v => v !== 'all');
      const idx = current.indexOf(vert);
      if (idx > -1) current.splice(idx, 1);
      else current.push(vert);
    }
    setFormData({ ...formData, allowedVerticals: current });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (isEditing && selectedRole) {
        await axios.put(`${API_BASE_URL}/api/v1/admin/roles-permissions/roles/${selectedRole._id}`, formData, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/api/v1/admin/roles-permissions/roles`, formData, { headers });
      }

      await fetchData();
      alert("Role saved successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Group permissions by group name
  const groupedPermissions = catalog.reduce((acc, curr) => {
    const g = curr.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(curr);
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <Security fontSize="large" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Granular RBAC Permission Matrix</h1>
            <p className="text-sm text-slate-500">Configure vertical category isolation, staff role permissions & city-level authority</p>
          </div>
        </div>
        <button
          onClick={handleNewRole}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
        >
          <Add fontSize="small" /> Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Role List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Roles ({roles.length})</span>
            <button onClick={fetchData} className="text-slate-400 hover:text-slate-600"><Refresh fontSize="small" /></button>
          </h3>
          <div className="space-y-2">
            {roles.map((r) => (
              <div
                key={r._id}
                onClick={() => selectRoleForEdit(r)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRole?._id === r._id
                    ? "border-indigo-600 bg-indigo-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 text-sm">{r.name}</h4>
                  {r.isSystemDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      System
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{r.description || "Custom operational role"}</p>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{r.permissions?.length || 0} permissions</span>
                  <span className="capitalize">{r.allowedVerticals?.join(', ') || 'all'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Permission Matrix & Vertical Assignment */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">
                {isEditing ? `Editing Role: ${formData.name}` : "Create New Role"}
              </h3>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
              >
                Save Role & Matrix
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Grocery Dispatch Manager"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role Type</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Grocery Manager">Grocery Manager</option>
                  <option value="Food Manager">Food Manager</option>
                  <option value="Home Services Manager">Home Services Manager</option>
                  <option value="Pharmacy Manager">Pharmacy Manager</option>
                  <option value="Courier Manager">Courier Manager</option>
                  <option value="Laundry Manager">Laundry Manager</option>
                  <option value="Finance Manager">Finance Manager</option>
                  <option value="Operations Manager">Operations Manager</option>
                </select>
              </div>
            </div>

            {/* Vertical Isolation Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Allowed Category Workspaces
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleVertical('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    formData.allowedVerticals.includes('all')
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🌐 All Verticals (Global)
                </button>
                {verticals.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleVertical(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      formData.allowedVerticals.includes(v)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {v.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Permission Checklist */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Module Permission Toggles
              </label>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50">
                    <h5 className="font-bold text-xs text-indigo-900 mb-2 uppercase tracking-wide">{group}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const checked = formData.permissions.includes(p.id) || formData.permissions.includes('*');
                        return (
                          <label
                            key={p.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(p.id)}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="text-slate-800 font-medium">{p.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


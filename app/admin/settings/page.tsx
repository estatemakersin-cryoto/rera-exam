// ══════════════════════════════════════════════════════════════════════════════
// SYSTEM SETTINGS ADMIN PAGE
// app/admin/settings/page.tsx
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string | null;
  dataType: string;
  category: string;
  isEditable: boolean;
  updatedAt: string;
}

type Category = "ALL" | "EXAM" | "PLATFORM" | "INSTITUTE" | "FEES" | "PRICING" | "PAYMENT";

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: "ALL", label: "All Settings", color: "gray" },
  { value: "EXAM", label: "Exam Settings", color: "blue" },
  { value: "PLATFORM", label: "Platform", color: "green" },
  { value: "INSTITUTE", label: "Institute", color: "purple" },
  { value: "FEES", label: "Fees", color: "yellow" },
  { value: "PRICING", label: "Pricing", color: "orange" },
  { value: "PAYMENT", label: "Payment", color: "teal" },
];

const DATA_TYPES = [
  { value: "STRING", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "BOOLEAN", label: "Yes/No" },
  { value: "JSON", label: "JSON" },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    label: "",
    description: "",
    dataType: "STRING",
    category: "PLATFORM",
  });

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/verify");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!data.user?.isAdmin) {
          router.push("/dashboard");
          return;
        }
      } catch {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // Load configs
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch settings");
      }
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const filteredConfigs = configs.filter(
    (config) => activeCategory === "ALL" || config.category === activeCategory
  );

  const openCreateModal = () => {
    setFormData({
      key: "",
      value: "",
      label: "",
      description: "",
      dataType: "STRING",
      category: activeCategory === "ALL" ? "PLATFORM" : activeCategory,
    });
    setEditingConfig(null);
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (config: SystemConfig) => {
    setFormData({
      key: config.key,
      value: config.value,
      label: config.label,
      description: config.description || "",
      dataType: config.dataType,
      category: config.category,
    });
    setEditingConfig(config);
    setModalMode("edit");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingConfig(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = "/api/admin/settings";
      const method = modalMode === "create" ? "POST" : "PUT";
      const body =
        modalMode === "create"
          ? formData
          : { id: editingConfig?.id, ...formData };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save setting");
      }

      setSuccess(
        modalMode === "create"
          ? "Setting created successfully!"
          : "Setting updated successfully!"
      );
      closeModal();
      loadConfigs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (config: SystemConfig) => {
    if (
      !confirm(
        `Are you sure you want to delete "${config.label}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/settings?id=${config.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete setting");
      }

      setSuccess("Setting deleted successfully!");
      loadConfigs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatValue = (config: SystemConfig) => {
    if (config.dataType === "BOOLEAN") {
      return config.value === "true" ? (
        <span className="text-green-600 font-medium">Yes</span>
      ) : (
        <span className="text-red-600 font-medium">No</span>
      );
    }
    if (config.dataType === "NUMBER") {
      return (
        <span className="font-mono text-blue-600">
          {parseInt(config.value).toLocaleString("en-IN")}
        </span>
      );
    }
    if (config.dataType === "JSON") {
      return (
        <span className="font-mono text-xs text-gray-600 truncate max-w-xs block">
          {config.value}
        </span>
      );
    }
    return <span className="text-gray-800">{config.value}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              System Settings
            </h1>
          </div>
          <p className="text-gray-600">
            Configure platform settings, pricing, and features
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Setting
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500">
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-green-500">
            ×
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === cat.value
                ? `bg-${cat.color}-600 text-white`
                : `bg-gray-100 text-gray-600 hover:bg-gray-200`
            }`}
            style={
              activeCategory === cat.value
                ? {
                    backgroundColor:
                      cat.color === "gray"
                        ? "#4B5563"
                        : cat.color === "blue"
                        ? "#2563EB"
                        : cat.color === "green"
                        ? "#16A34A"
                        : "#9333EA",
                  }
                : {}
            }
          >
            {cat.label}
            <span className="ml-2 text-sm opacity-75">
              (
              {cat.value === "ALL"
                ? configs.length
                : configs.filter((c) => c.category === cat.value).length}
              )
            </span>
          </button>
        ))}
      </div>

      {/* Settings Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Setting
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConfigs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No settings found.{" "}
                  <button
                    onClick={openCreateModal}
                    className="text-blue-600 hover:underline"
                  >
                    Create one
                  </button>
                </td>
              </tr>
            ) : (
              filteredConfigs.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{config.label}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {config.key}
                      </p>
                      {config.description && (
                        <p className="text-xs text-gray-400 mt-1">
                          {config.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatValue(config)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {config.dataType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        config.category === "EXAM"
                          ? "bg-blue-100 text-blue-700"
                          : config.category === "PLATFORM"
                          ? "bg-green-100 text-green-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {config.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {config.isEditable && (
                        <button
                          onClick={() => openEditModal(config)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(config)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {modalMode === "create" ? "Add New Setting" : "Edit Setting"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="exam_package_price"
                    required
                    disabled={modalMode === "edit"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier (snake_case)
                  </p>
                </div>

                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Exam Package Price"
                    required
                  />
                </div>

                {/* Data Type & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Type
                    </label>
                    <select
                      value={formData.dataType}
                      onChange={(e) =>
                        setFormData({ ...formData, dataType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {DATA_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EXAM">Exam</option>
                      <option value="PLATFORM">Platform</option>
                      <option value="INSTITUTE">Institute</option>
                    </select>
                  </div>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value <span className="text-red-500">*</span>
                  </label>
                  {formData.dataType === "BOOLEAN" ? (
                    <select
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : formData.dataType === "JSON" ? (
                    <textarea
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder='{"key": "value"}'
                      rows={4}
                      required
                    />
                  ) : (
                    <input
                      type={formData.dataType === "NUMBER" ? "number" : "text"}
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={
                        formData.dataType === "NUMBER" ? "350" : "Enter value"
                      }
                      required
                    />
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description for this setting"
                    rows={2}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : modalMode === "create"
                      ? "Create Setting"
                      : "Update Setting"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import {
  getAllLeads,
  searchLeads,
  updateLeadStatus,
} from "../api/client";

const STATUS_STYLES = {
  new: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "New",
  },
  Contacted: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
    label: "Contacted",
  },
  Closed: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Closed",
  },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {style.label}
    </span>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBudget(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      setError("");
      const res = await getAllLeads();
      setLeads(res.data.data);
    } catch (err) {
      setError("Failed to load leads. Make sure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!query.trim()) {
        fetchLeads();
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          const res = await searchLeads(query);
          setLeads(res.data.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [fetchLeads]
  );

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus =
      currentStatus === "new"
        ? "Contacted"
        : currentStatus === "Contacted"
        ? "Closed"
        : "new";

    setUpdatingId(id);
    try {
      const res = await updateLeadStatus(id, nextStatus);
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === id ? { ...lead, status: res.data.data.status } : lead
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  LeadDesk Mini
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">
                  Admin Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                {admin?.name || "Admin"}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Leads
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {leads.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacted
            </p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {leads.filter((l) => l.status === "Contacted").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Closed
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {leads.filter((l) => l.status === "Closed").length}
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4 sm:p-6">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search by name, email, message, or status..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchLeads}
              className="text-red-600 font-medium hover:text-red-800 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                {searchQuery.trim()
                  ? "No leads match your search"
                  : "No leads yet"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery.trim()
                  ? "Try a different search term"
                  : "Leads submitted via the public form will appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Budget
                    </th>
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Message
                    </th>
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">
                          {lead.name}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <p className="text-gray-600 text-sm truncate max-w-[180px]">
                          {lead.email}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <p className="text-gray-900 font-medium">
                          {formatBudget(lead.budget)}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                        <p className="text-gray-600 text-sm truncate max-w-[200px]">
                          {lead.message}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <p className="text-gray-500 text-sm whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() =>
                            handleStatusToggle(lead._id, lead.status)
                          }
                          disabled={updatingId === lead._id}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {updatingId === lead._id ? (
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            "Toggle Status"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://leaddisk-production.up.railway.app/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("leaddesk_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("leaddesk_token");
      localStorage.removeItem("leaddesk_admin");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---- Public API ----

export const submitLead = (data) => apiClient.post("/user/submit", data);

// ---- Auth API ----

export const loginAdmin = (data) => apiClient.post("/auth/login", data);
export const getMe = () => apiClient.get("/auth/me");
export const logoutAdmin = () => apiClient.post("/auth/logout");

// ---- Admin Leads API ----

export const getAllLeads = () => apiClient.get("/user/admin");
export const getLeadById = (id) => apiClient.get(`/user/admin/${id}`);
export const searchLeads = (query) =>
  apiClient.get(`/user/admin/search?q=${encodeURIComponent(query)}`);
export const updateLeadStatus = (id, status) =>
  apiClient.patch(`/user/admin/${id}/status`, { status });

export default apiClient;

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginAdmin, getMe, logoutAdmin } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("leaddesk_token");
    const storedAdmin = localStorage.getItem("leaddesk_admin");

    if (token && storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
        // Verify token is still valid
        getMe()
          .then((res) => {
            console.log("running get ")
            const userData = res.data.data.user;
            setAdmin(userData);
            localStorage.setItem("leaddesk_admin", JSON.stringify(userData));
          })
          .catch(() => {
            // Token expired, clean up
            localStorage.removeItem("leaddesk_token");
            localStorage.removeItem("leaddesk_admin");
            setAdmin(null);
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem("leaddesk_token");
        localStorage.removeItem("leaddesk_admin");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError("");
    try {
      const res = await loginAdmin({ email, password });
      const token = res.data.token;
      const userData = res.data.data.user;

      localStorage.setItem("leaddesk_token", token);
      localStorage.setItem("leaddesk_admin", JSON.stringify(userData));
      setAdmin(userData);
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      // Ignore server errors during logout
    }
    localStorage.removeItem("leaddesk_token");
    localStorage.removeItem("leaddesk_admin");
    setAdmin(null);
  }, []);

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;

import { createContext, useContext, useState, useEffect } from "react";
import { getTokenFromCookies, clearAuthCookies } from "../auth/authService";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = getTokenFromCookies();
    const role = Cookies.get("role");
    const email = Cookies.get("email");
    
    if (token && role) {
      console.log("✅ Session restored: role =", role);
      setSession({ token, role, email });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log("🔐 Login: userData =", userData);
    console.log("🔐 Login: role =", userData?.role);
    
    // Ensure role is stored in session
    const sessionData = {
      token: userData?.token,
      role: userData?.role || userData?.user?.role,
      email: userData?.email || userData?.user?.email
    };
    
    console.log("🔐 Final session data:", sessionData);
    setSession(sessionData);
  };

  const logout = () => {
    console.log("🚪 Logging out...");
    clearAuthCookies();
    Cookies.remove("role");
    Cookies.remove("email");
    setSession(null);
    window.location.href = "/auth";
  };

  const isAuthenticated = () => {
    return session !== null && getTokenFromCookies() !== null;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        login, 
        logout, 
        loading,
        isAuthenticated 
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

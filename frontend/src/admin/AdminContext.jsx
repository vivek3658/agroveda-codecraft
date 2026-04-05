import { createContext, useContext, useMemo, useState } from "react";
import {
  getAdminSession,
  loginAdmin as loginAdminService,
  logoutAdmin as logoutAdminService,
} from "./adminService";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [adminSession, setAdminSession] = useState(() => getAdminSession());

  const value = useMemo(
    () => ({
      adminSession,
      loginAdmin: (username, password) => {
        const session = loginAdminService(username, password);
        setAdminSession(session);
        return session;
      },
      logoutAdmin: () => {
        logoutAdminService();
        setAdminSession(null);
      },
    }),
    [adminSession]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);

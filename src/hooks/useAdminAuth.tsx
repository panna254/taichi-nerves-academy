import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Role, User } from "@/types/admin";

type AuthContextValue = {
  user: User | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, role: Role) => {
    // Extract name from email and capitalize it
    const name = email.split("@")[0]?.replace(".", " ") || "Admin";
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    setUser({
      id: `auth-${Date.now()}`,
      name: capitalizedName,
      email,
      role,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
};




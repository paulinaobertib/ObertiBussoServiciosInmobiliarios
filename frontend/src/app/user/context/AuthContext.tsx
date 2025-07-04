// src/app/user/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Role, User } from "../types/user";
import { api } from '../../../api';
import { NotificationType, UserNotificationPreference } from "../types/notification";

export type AuthInfo = User & { roles: Role[]; preferences: UserNotificationPreference[] };

interface AuthContextValue {
  info: AuthInfo | null;
  setInfo: React.Dispatch<React.SetStateAction<AuthInfo | null>>;
  isLogged: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  info: null,
  setInfo: () => {},
  isLogged: false,
  isAdmin: false,
  loading: false,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = sessionStorage.getItem("authInfo");
  const [info, setInfo] = useState<AuthInfo | null>(stored ? JSON.parse(stored) : null);
  const [loading, setLoading] = useState(!stored);

  const GW_URL = import.meta.env.VITE_GATEWAY_URL as string;
  const loginUrl = `${GW_URL}/oauth2/authorization/keycloak-client?next=/`;

  const isLogged = !!info;
  const isAdmin = info?.roles.includes("ADMIN" as Role) ?? false;

  // Sync to sessionStorage
  useEffect(() => {
    if (info) sessionStorage.setItem("authInfo", JSON.stringify(info));
    else sessionStorage.removeItem("authInfo");
  }, [info]);

  // Helpers for preferences
  const loadPreferences = async (userId: string) => {
    const resp = await api.get<UserNotificationPreference[]>(`/users/preference/user/${userId}`);
    return resp.data;
  };
  const createPreference = async (userId: string, type: NotificationType) => {
    const resp = await api.post<UserNotificationPreference>(
      `/users/preference/create`,
      { userId, type, enabled: true }
    );
    return resp.data;
  };

  // Load user info and seed preferences lazily
  const loadUserInfo = async () => {
    setLoading(true);
    try {
      const userRes = await api.get<User>("/users/user/me");
      const user = userRes.data;
      const rolesRes = await api.get<Role[]>(`/users/user/role/${user.id}`);
      const roles = rolesRes.data.map(r => r.toUpperCase() as Role);

                  let preferences: UserNotificationPreference[] = [];
            if (roles.includes("ADMIN" as Role)) {
                // Admin users do not use preferences
                preferences = [];
            } else {
                // Load or seed preferences for regular users
                let prefs = await loadPreferences(user.id);
                if (!prefs.length) {
                    const allTypes: NotificationType[] = ['PROPIEDADNUEVA', 'PROPIEDADINTERES'];
                    prefs = [];
                    for (const type of allTypes) {
                        const p = await createPreference(user.id, type);
                        prefs.push(p);
                    }
                }
                preferences = prefs;
            }

            setInfo({ ...user, roles, preferences });
    } catch {
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stored) loadUserInfo();
  }, []);

  const login = () => { window.location.href = loginUrl; };
  const logout = () => {
    setInfo(null);
    sessionStorage.clear();
    window.location.href = `${GW_URL}/logout`;
  };
  const refreshUser = async () => { await loadUserInfo(); };

  return (
    <AuthContext.Provider
      value={{ info, setInfo, isLogged, isAdmin, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};

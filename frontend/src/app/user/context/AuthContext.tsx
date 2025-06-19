// src/app/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { Role, User } from "../types/user";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export type AuthInfo = (User & { roles: Role[] }) | null;

interface AuthContextValue {
    info: AuthInfo;
    isAdmin: boolean;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    info: null,
    isAdmin: false,
    loading: false,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [info, setInfo] = useState<AuthInfo>(null);
    const [loading, setLoading] = useState(true);  // ← nuevo

    const GW_URL = import.meta.env.VITE_GATEWAY_URL as string;

    useEffect(() => {
        let mounted = true;
        api.get<User>("/users/user/me")
            .then(r1 => {
                const user = r1.data;
                return api
                    .get<Role[]>(`/users/user/role/${user.id}`)
                    .then(r2 => ({
                        ...user,
                        roles: r2.data.map(r => r.toUpperCase() as Role),
                    }));
            })
            .then(full => mounted && setInfo(full))
            .catch(() => mounted && setInfo(null))
            .finally(() => mounted && setLoading(false));  // ← ponemos loading=false aquí

        return () => { mounted = false; };
    }, []);

    const isAdmin = info?.roles.includes("ADMIN" as Role) ?? false;

    // Aquí la función logout
    const logout = async () => {
        window.location.href = `${GW_URL}/logout`;
    };

    return (
        <AuthContext.Provider value={{ info, isAdmin, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);
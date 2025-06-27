import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Role, User } from "../types/user";
import { api } from '../../../api';

export type AuthInfo = (User & { roles: Role[] }) | null;

interface AuthContextValue {
    info: AuthInfo;
    setInfo: React.Dispatch<React.SetStateAction<AuthInfo>>; // ← nuevo
    isLogged: boolean;
    isAdmin: boolean;
    loading: boolean;
    login: () => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    info: null,
    setInfo: () => { },
    isLogged: false,
    isAdmin: false,
    loading: false,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    // hidratar desde sessionStorage
    const stored = sessionStorage.getItem("authInfo");
    const [info, setInfo] = useState<AuthInfo>(stored ? JSON.parse(stored) : null);
    const [loading, setLoading] = useState(!stored);

    const GW_URL = import.meta.env.VITE_GATEWAY_URL as string;
    const loginUrl = `${GW_URL}/oauth2/authorization/keycloak-client?next=/`;

    const isLogged = !!info;
    const isAdmin = info?.roles.includes("ADMIN" as Role) ?? false;

    // sincronizar sessionStorage
    useEffect(() => {
        if (info) sessionStorage.setItem("authInfo", JSON.stringify(info));
        else sessionStorage.removeItem("authInfo");
    }, [info]);

    // cargar usuario (sigue usando /me → JWT)
    const loadUserInfo = async () => {
        setLoading(true);
        try {
            // ahora sí devolvemos un `User` completo
            const userRes = await api.get<User>("/users/user/me");
            const user = userRes.data;

            // y sacamos los roles
            const rolesRes = await api.get<Role[]>(`/users/user/role/${user.id}`);

            setInfo({
                ...user,
                roles: rolesRes.data.map(r => r.toUpperCase() as Role),
            });
        } catch {
            setInfo(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (!stored) loadUserInfo(); }, []);

    const login = () => { window.location.href = loginUrl; };
    const logout = () => {
        setInfo(null);
        sessionStorage.clear();
        window.location.href = `${GW_URL}/logout`;
    };

    const refreshUser = async () => { await loadUserInfo(); };

    return (
        <AuthContext.Provider value={{
            info, setInfo, isLogged, isAdmin, loading,
            login, logout, refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);

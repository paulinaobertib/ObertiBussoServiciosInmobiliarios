import {
    createContext, useContext, useEffect, useState, ReactNode,
} from "react";
import axios from "axios";
import { Role, User } from "../types/user";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});
export type AuthInfo = (User & { roles: Role[] }) | null;

/**
 * El contexto expone la info del usuario y un flag isAdmin
 */
interface AuthContextValue {
    info: AuthInfo;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({ info: null, isAdmin: false });

/**
 * AuthProvider: carga usuario y roles al montar usando un solo useEffect,
 * y expone isAdmin calculado.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [info, setInfo] = useState<AuthInfo>(null);

    useEffect(() => {
        let mounted = true;

        // ① /users/user/me → usuario sin roles
        api.get<User>("/users/user/me")
            .then(r1 => {
                const user = r1.data;
                // ② /users/user/role/{id} → roles
                return api
                    .get<Role[]>(`/users/user/role/${user.id}`)
                    .then(r2 => ({
                        ...user,
                        roles: r2.data.map(r => r.toUpperCase() as Role),
                    }));
            })
            .then(full => {
                if (mounted) setInfo(full);
            })
            .catch(() => {
                if (mounted) setInfo(null);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const isAdmin = info?.roles.includes("ADMIN" as Role) ?? false;

    return (
        <AuthContext.Provider value={{ info, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook para obtener la info completa */
export const useAuth = (): AuthInfo => useContext(AuthContext).info;

/** Hook para verificar si hay usuario */
export const useIsLogged = (): boolean => useAuth() !== null;

/** Hook específico para admin */
export const useIsAdmin = (): boolean => useContext(AuthContext).isAdmin;

/** Hook genérico para otros roles */
export const useHasRole = (role: Role): boolean =>
    useContext(AuthContext).info?.roles.includes(role) ?? false;

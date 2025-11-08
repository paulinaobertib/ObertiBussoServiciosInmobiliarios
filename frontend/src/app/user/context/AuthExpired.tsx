import { useEffect } from "react";
import { useAuthContext } from "./AuthContext";
import { Loading } from "../../shared/components/Loader";

export default function SessionExpiredDialog() {
  const { sessionExpired, login } = useAuthContext();

  useEffect(() => {
    if (!sessionExpired) return;
    const t = setTimeout(() => {
      try {
        login();
      } catch {}
    }, 5000);
    return () => clearTimeout(t);
  }, [sessionExpired, login]);

  if (!sessionExpired) return null;

  return <Loading message="Tu sesión finalizó. Redirigiendo a la pagina de Inicio de Sesión." />;
}

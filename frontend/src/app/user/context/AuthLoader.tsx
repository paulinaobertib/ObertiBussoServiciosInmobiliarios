import { useEffect } from "react";
import { Loading } from "../../shared/components/Loader";
import { useAuthContext } from "./AuthContext";

export const AuthLoaderOverlay = () => {
  const { loading, refreshing } = useAuthContext();
  const isActive = loading || refreshing;

  useEffect(() => {
    if (isActive) {
      document.body.classList.add("auth-loading");
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.classList.remove("auth-loading");
      document.body.style.overflow = "";
      document.body.style.height = "";
    }
    return () => {
      document.body.classList.remove("auth-loading");
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [isActive]);

  return isActive ? <Loading /> : null;
};

export default AuthLoaderOverlay;

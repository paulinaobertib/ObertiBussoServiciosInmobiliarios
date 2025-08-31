import { Loading } from "../../shared/components/Loader";
import { useAuthContext } from "./AuthContext";

export const AuthLoaderOverlay = () => {
  const { loading, refreshing } = useAuthContext();
  return loading || refreshing ? <Loading /> : null;
};

export default AuthLoaderOverlay;

import { Loading } from '../../shared/components/Loader';
import { useAuthContext } from './AuthContext';

export const AuthLoaderOverlay = () => {
  const { loading } = useAuthContext();
  return loading ? (
    <Loading message="Espere, estamos actualizando su experiencia..." />
  ) : null;
};

export default AuthLoaderOverlay;

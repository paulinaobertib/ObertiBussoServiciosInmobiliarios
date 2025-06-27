import { ReactNode } from 'react';
import {
    Routes as RoutesDom,
    Route,
    Navigate,
} from 'react-router-dom';

import { ROUTES } from './lib';
import Home from './pages/HomePage';
import CreatePropertyPage from './pages/CreatePropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import Compare from './pages/ComparePage'
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AdministratorPanel from './pages/AdministratorPanel';
import PropertyCommentsPage from './pages/PropertyCommentsPage';
import PropertyMaintenancePage from './pages/PropertyMaintenancePage';
import FavoritesPage from './pages/FavoritesPage'

import { useAuthContext } from './app/user/context/AuthContext';
import { useGlobalAlert } from './app/shared/context/AlertContext';
import UserProfilePage from './pages/UserProfile';
import ContactPage from './pages/ContactPage';
import NewsPage from './pages/NewsPage';

function RequireAdmin({ children }: { children: ReactNode }) {
    const { isAdmin, loading } = useAuthContext()

    const { showAlert } = useGlobalAlert();

    if (loading) {
        return null; // o un spinner si quieres
    }

    // Si no es admin, lo mandamos al home
    if (!isAdmin) {
        showAlert('No tienes permisos de administrador', 'error');
        return <Navigate to={ROUTES.HOME_APP} replace />;
    }

    return <>{children}</>;
}

function RequireLogin({ children }: { children: ReactNode }) {
    const { loading, isLogged } = useAuthContext()

    const { showAlert } = useGlobalAlert();

    if (loading) {
        return null; // o un spinner si quieres
    }

    if (!isLogged) {
        showAlert('Debes loguearte para acceder', 'error');
        return <Navigate to={ROUTES.HOME_APP} replace />;
    }

    return <>{children}</>;
}

export default function Routes() {
    return (
        <RoutesDom>
            <Route path={ROUTES.HOME_APP} element={<Home />} />

            {/* Rutas protegidas para admin */}
            <Route path={ROUTES.NEW_PROPERTY} element={
                <RequireAdmin> <CreatePropertyPage /> </RequireAdmin>
            } />

            <Route path={ROUTES.EDIT_PROPERTY} element={
                <RequireAdmin> <EditPropertyPage /> </RequireAdmin>
            } />

            <Route path={ROUTES.ADMIN_PANEL} element={
                <RequireAdmin> <AdministratorPanel /> </RequireAdmin>
            } />

            <Route path={ROUTES.PROPERTY_COMMENTS} element={
                <RequireAdmin> <PropertyCommentsPage /> </RequireAdmin>
            } />

            <Route path={ROUTES.PROPERTY_MAINTENANCE} element={
                <RequireAdmin> <PropertyMaintenancePage /> </RequireAdmin>
            } />

            <Route path={ROUTES.USER_PROFILE} element={
                <RequireLogin> <UserProfilePage /> </RequireLogin>
            } />

            <Route path={ROUTES.FAVORITES} element={
                <RequireLogin> <FavoritesPage /> </RequireLogin>
            } />

            <Route path={ROUTES.COMPARE} element={<Compare />} />
            <Route path={ROUTES.PROPERTY_DETAILS} element={<PropertyDetailsPage />} />
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            <Route path={ROUTES.NEWS} element={<NewsPage />} />

            <Route path="*" element={<Navigate to={ROUTES.HOME_APP} replace />} />

        </RoutesDom>
    );
};

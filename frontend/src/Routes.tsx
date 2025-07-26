import { ReactNode } from 'react';
import {
    Routes as RoutesDom,
    Route,
    Navigate,
} from 'react-router-dom';

import { ROUTES } from './lib';
import Home from './pages/HomePage';
import ManagePropertyPage from './pages/ManagePropertyPage';
import Compare from './pages/ComparePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AdministratorPage from './pages/AdministratorPage';
import FavoritesPage from './pages/FavoritesPage';
import UserProfilePage from './pages/UserProfilePage';
import ContactPage from './pages/ContactPage';
import NewsPage from './pages/NewsPage';
import NewsDetailsPage from './pages/NewsDetailsPage';
import PoliciesPage from './pages/PoliciesPage';
import { PropertyNotesPage } from './pages/PropertyNotesPage';

import { useAuthContext } from './app/user/context/AuthContext';
import { useGlobalAlert } from './app/shared/context/AlertContext';
import ContractsPage from './pages/ContractsPage';
import ManageContractPage from './pages/ManageContractPage';
import AppointmentPage from './pages/AppointmentPage';

/* ---------- Guards ---------- */
function RequireAdmin({ children }: { children: ReactNode }) {
    const { isAdmin, loading } = useAuthContext();
    const { showAlert } = useGlobalAlert();

    if (loading) return null;
    if (!isAdmin) {
        showAlert('No tienes permisos de administrador', 'error');
        return <Navigate to={ROUTES.HOME_APP} replace />;
    }
    return <>{children}</>;
}

function RequireLogin({ children }: { children: ReactNode }) {
    const { isLogged, loading } = useAuthContext();
    const { showAlert } = useGlobalAlert();

    if (loading) return null;
    if (!isLogged) {
        showAlert('Debes loguearte para acceder', 'error');
        return <Navigate to={ROUTES.HOME_APP} replace />;
    }
    return <>{children}</>;
}

export function RequireAdminOrTenant({ children }: { children: ReactNode }) {
    const { isAdmin, isTenant, loading } = useAuthContext();
    const { showAlert } = useGlobalAlert();

    if (loading) return null;

    if (!isAdmin && !isTenant) {
        showAlert("No tienes permisos para acceder a esta sección", "error");
        return <Navigate to={ROUTES.HOME_APP} replace />;
    }

    return <>{children}</>;
}

/* ---------- Rutas ---------- */
export default function Routes() {
    return (
        <RoutesDom>
            <Route path={ROUTES.HOME_APP} element={<Home />} />

            {/* ---- crear / editar (solo admin) ---- */}
            <Route
                path={ROUTES.NEW_PROPERTY}          // '/properties/new'
                element={
                    <RequireAdmin>
                        <ManagePropertyPage />
                    </RequireAdmin>
                }
            />
            <Route
                path={ROUTES.EDIT_PROPERTY}         // '/properties/:id/edit'
                element={
                    <RequireAdmin>
                        <ManagePropertyPage />
                    </RequireAdmin>
                }
            />

            <Route
                path={ROUTES.NEW_CONTRACT}          // '/properties/new'
                element={
                    <RequireAdmin>
                        <ManageContractPage />
                    </RequireAdmin>
                }
            />
            <Route
                path={ROUTES.EDIT_CONTRACT}         // '/properties/:id/edit'
                element={
                    <RequireAdmin>
                        <ManageContractPage />
                    </RequireAdmin>
                }
            />

            {/* ---- Panel administrador ---- */}
            <Route
                path={ROUTES.ADMIN_PAGE}
                element={
                    <RequireAdmin>
                        <AdministratorPage />
                    </RequireAdmin>
                }
            />

            <Route
                path={ROUTES.CONTRACT}
                element={
                    <RequireAdminOrTenant>
                        <ContractsPage />
                    </RequireAdminOrTenant>
                }
            />
            <Route
                path={ROUTES.PROPERTY_NOTES}
                element={
                    <RequireAdmin>
                        <PropertyNotesPage />
                    </RequireAdmin>
                }
            />

            <Route
                path={ROUTES.APPOINTMENTS}
                element={
                    <RequireAdmin>
                        <AppointmentPage />
                    </RequireAdmin>
                }
            />

            {/* ---- Rutas protegidas por login ---- */}
            <Route
                path={ROUTES.USER_PROFILE}
                element={
                    <RequireLogin>
                        <UserProfilePage />
                    </RequireLogin>
                }
            />
            <Route
                path={ROUTES.FAVORITES}
                element={
                    <RequireLogin>
                        <FavoritesPage />
                    </RequireLogin>
                }
            />

            {/* ---- Panel inquilino ---- */}
            {/* <Route
                path={ROUTES.TENANT}
                element={
                    <RequireTenant>
                        <TenantPage />
                    </RequireTenant>
                }
            /> */}

            {/* ---- Públicas ---- */}
            <Route path={ROUTES.COMPARE} element={<Compare />} />
            <Route path={ROUTES.PROPERTY_DETAILS} element={<PropertyDetailsPage />} />
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            <Route path={ROUTES.NEWS} element={<NewsPage />} />
            <Route path={ROUTES.NEWS_DETAILS} element={<NewsDetailsPage />} />
            <Route path={ROUTES.POLICIES} element={<PoliciesPage />} />

            {/* ---- Catch-all ---- */}
            <Route path="*" element={<Navigate to={ROUTES.HOME_APP} replace />} />
        </RoutesDom>
    );
}

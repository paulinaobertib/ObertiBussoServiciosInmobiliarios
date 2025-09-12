import { ReactNode, useEffect, useState } from 'react';
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
import SurveyPage from './pages/SurveyPage';
import { PropertyNotesPage } from './pages/PropertyNotesPage';

import { useAuthContext } from './app/user/context/AuthContext';
import { useGlobalAlert } from './app/shared/context/AlertContext';
import ContractsPage from './pages/ContractsPage';
import ManageContractPage from './pages/ManageContractPage';
import AppointmentPage from './pages/AppointmentPage';
import ViewStatsPage from './pages/ViewStatsPage';
import ContractDetailPage from './pages/ContractDetailPage';
//import ContractDetailUserPage from './pages/ContractDetailTenantPage';

/* ---------- Guards ---------- */
function RequireAdmin({ children }: { children: ReactNode }) {
    const { isAdmin, loading } = useAuthContext();
    const { showAlert } = useGlobalAlert();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin) {
            showAlert('No tienes permisos de administrador', 'error');
            setShouldRedirect(true);
        }
    }, [loading, isAdmin, showAlert]);

    if (loading) return null;
    if (shouldRedirect) return <Navigate to={ROUTES.HOME_APP} replace />;
    return <>{children}</>;
}

function RequireLogin({ children }: { children: ReactNode }) {
    const { isLogged, loading } = useAuthContext();
    const { showAlert } = useGlobalAlert();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (!loading && !isLogged) {
            showAlert('Debes loguearte para acceder', 'error');
            setShouldRedirect(true);
        }
    }, [loading, isLogged, showAlert]);

    if (loading) return null;
    if (shouldRedirect) return <Navigate to={ROUTES.HOME_APP} replace />;
    return <>{children}</>;
}

export function RequireAdminOrTenant({ children }: { children: ReactNode }) {
    const { isAdmin, isTenant, loading } = useAuthContext();
    const { showAlert } = useGlobalAlert();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin && !isTenant) {
            showAlert("No tienes permisos para acceder a esta sección", "error");
            setShouldRedirect(true);
        }
    }, [loading, isAdmin, isTenant, showAlert]);

    if (loading) return null;
    if (shouldRedirect) return <Navigate to={ROUTES.HOME_APP} replace />;
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
                path={ROUTES.NEW_CONTRACT}
                element={
                    <RequireAdmin>
                        <ManageContractPage />
                    </RequireAdmin>
                }
            />
            <Route
                path={ROUTES.EDIT_CONTRACT}
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

            {/* admin y tenant comparten la misma ruta */}
            <Route
                path={ROUTES.CONTRACT_DETAIL}
                element={
                    <RequireAdminOrTenant>
                        <ContractDetailPage />
                    </RequireAdminOrTenant>
                }
            />
            {/* <Route
                path={ROUTES.CONTRACT_DETAIL_TENANT}
                element={
                    <RequireAdminOrTenant>
                        <ContractDetailUserPage />
                    </RequireAdminOrTenant>
                }
            /> */}

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
            <Route
                path={ROUTES.STATS}
                element={
                    <RequireAdmin>
                        <ViewStatsPage />
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

            {/* ---- Públicas ---- */}
            <Route path={ROUTES.COMPARE} element={<Compare />} />
            <Route path={ROUTES.PROPERTY_DETAILS} element={<PropertyDetailsPage />} />
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            <Route path={ROUTES.NEWS} element={<NewsPage />} />
            <Route path={ROUTES.NEWS_DETAILS} element={<NewsDetailsPage />} />
            <Route path={ROUTES.POLICIES} element={<PoliciesPage />} />
            <Route path={ROUTES.SURVEY} element={<SurveyPage />} />

            {/* ---- Catch-all ---- */}
            <Route path="*" element={<Navigate to={ROUTES.HOME_APP} replace />} />
        </RoutesDom>
    );
}

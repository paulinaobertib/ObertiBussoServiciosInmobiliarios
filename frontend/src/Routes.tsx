import { ReactNode, Suspense, lazy, useEffect, useState } from "react";
import { Routes as RoutesDom, Route, Navigate } from "react-router-dom";

import { ROUTES } from "./lib";
import Home from "./pages/HomePage";
import { useAuthContext } from "./app/user/context/AuthContext";
import { useGlobalAlert } from "./app/shared/context/AlertContext";

const ManagePropertyPage = lazy(() => import("./pages/ManagePropertyPage"));
const Compare = lazy(() => import("./pages/ComparePage"));
const PropertyDetailsPage = lazy(() => import("./pages/PropertyDetailsPage"));
const AdministratorPage = lazy(() => import("./pages/AdministratorPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const NewsDetailsPage = lazy(() => import("./pages/NewsDetailsPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
const SurveyPage = lazy(() => import("./pages/SurveyPage"));
const PropertyNotesPage = lazy(() =>
  import("./pages/PropertyNotesPage").then((m) => ({ default: m.PropertyNotesPage })),
);

const ContractsPage = lazy(() => import("./pages/ContractsPage"));
const ManageContractPage = lazy(() => import("./pages/ManageContractPage"));
const AppointmentPage = lazy(() => import("./pages/AppointmentPage"));
const ViewStatsPage = lazy(() => import("./pages/ViewStatsPage"));
const ContractDetailPage = lazy(() => import("./pages/ContractDetailPage"));
const ReceiptsPage = lazy(() => import("./pages/ReceiptsPage"));
const TenantPortalPage = lazy(() => import("./pages/TenantPortalPage"));
//import ContractDetailUserPage from './pages/ContractDetailTenantPage';

/* ---------- Guards ---------- */
function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuthContext();
  const { showAlert } = useGlobalAlert();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      showAlert("No tienes permisos de administrador", "error");
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
      showAlert("Debes loguearte para acceder", "error");
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

// contratos: admin, o inquilino al que el admin le habilitó la sección
function RequireContractsAccess({ children }: { children: ReactNode }) {
  const { isAdmin, isTenant, canViewContracts, loading } = useAuthContext();
  if (loading) return null;
  if (isAdmin || (isTenant && canViewContracts)) return <>{children}</>;
  if (isTenant) return <Navigate to={ROUTES.TENANT} replace />;
  return <RequireAdminOrTenant>{children}</RequireAdminOrTenant>;
}

/* ---------- Rutas ---------- */
export default function Routes() {
  return (
    <Suspense fallback={null}>
      <RoutesDom>
      <Route path={ROUTES.HOME_APP} element={<Home />} />

      {/* ---- crear / editar (solo admin) ---- */}
      <Route
        path={ROUTES.NEW_PROPERTY} // '/properties/new'
        element={
          <RequireAdmin>
            <ManagePropertyPage />
          </RequireAdmin>
        }
      />
      <Route
        path={ROUTES.EDIT_PROPERTY} // '/properties/:id/edit'
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
          <RequireContractsAccess>
            <ContractsPage />
          </RequireContractsAccess>
        }
      />

      {/* admin y tenant comparten la misma ruta */}
      <Route
        path={ROUTES.CONTRACT_DETAIL}
        element={
          <RequireContractsAccess>
            <ContractDetailPage />
          </RequireContractsAccess>
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
      <Route
        path={ROUTES.RECEIPTS}
        element={
          <RequireAdmin>
            <ReceiptsPage />
          </RequireAdmin>
        }
      />

      {/* ---- Portal del inquilino: contratos y/o recibos según lo que habilitó el admin ---- */}
      <Route
        path={ROUTES.TENANT}
        element={
          <RequireAdminOrTenant>
            <TenantPortalPage />
          </RequireAdminOrTenant>
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
    </Suspense>
  );
}

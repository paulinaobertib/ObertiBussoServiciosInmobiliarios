import { Route, Routes as RoutesDom } from 'react-router-dom';

import { ROUTES } from './lib';
import Home from './pages/HomePage';
import CreatePropertyPage from './pages/CreatePropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import Compare from './pages/ComparePage'
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AdministratorPanel from './pages/AdministratorPanel';
import PropertyCommentsPage from './pages/PropertyCommentsPage';
import PropertyMaintenancePage from './pages/PropertyMaintenancePage';

export default function Routes() {
    return (
        <RoutesDom>
            <Route path={ROUTES.HOME_APP} element={<Home />} />
            <Route path={ROUTES.NEW_PROPERTY} element={<CreatePropertyPage />} />
            <Route path={ROUTES.EDIT_PROPERTY} element={<EditPropertyPage />} />
            <Route path={ROUTES.COMPARE} element={<Compare />} />
            <Route path={ROUTES.PROPERTY_DETAILS} element={<PropertyDetailsPage />} />
            <Route path={ROUTES.ADMIN_PANEL} element={<AdministratorPanel />} />
            <Route path={ROUTES.PROPERTY_COMMENTS} element={<PropertyCommentsPage />} />
            <Route path={ROUTES.PROPERTY_MAINTENANCE} element={<PropertyMaintenancePage />} />
        </RoutesDom>
    );
};

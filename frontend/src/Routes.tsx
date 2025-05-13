import { Route, Routes as RoutesDom } from 'react-router-dom';

import { ROUTES } from './lib';
import Home from './pages/HomePage';
import CreatePropertyPage from './pages/CreatePropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import Compare from './pages/ComparePage'
import PropertyDetailsPage from './pages/PropertyDetailsPage';

export default function Routes() {
    return (
        <RoutesDom>
            <Route path={ROUTES.HOME_APP} element={<Home />} />
            <Route path={ROUTES.NEW_PROPERTY} element={<CreatePropertyPage />} />
            <Route path={ROUTES.EDIT_PROPERTY} element={<EditPropertyPage />} />
            <Route path={ROUTES.COMPARE} element={<Compare />} />
            <Route path={ROUTES.PROPERTY_DETAILS} element={<PropertyDetailsPage />} />
        </RoutesDom>
    );
};

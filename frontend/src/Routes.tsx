import { Route, Routes as RoutesDom } from 'react-router-dom';

import { ROUTES } from './lib';
import Home from './pages/home';
import Compare from './pages/compare'
import PropertyDetailsPage from './pages/propertyDetailsPage';

export const Routes = () => {
    return (
        <RoutesDom>
            <Route path={ROUTES.HOME_APP} element={<Home />} />
            <Route path={ROUTES.COMPARE} element={<Compare />} />
            <Route path={ROUTES.PROPERTY_DETAILS} element={<PropertyDetailsPage />} />
        </RoutesDom>
    );
};
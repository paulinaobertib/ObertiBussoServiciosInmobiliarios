import { Route, Routes as RoutesDom } from 'react-router-dom';

import { ROUTES } from './lib';
import Home from './pages/home';
import NewProperty from './pages/createProperty'

export const Routes = () => {
    return (
        <RoutesDom>
            <Route path={ROUTES.HOME_APP} element={<Home />} />
            <Route path={ROUTES.NEW_PROPERTY} element={<NewProperty />} />
        </RoutesDom>
    );
};
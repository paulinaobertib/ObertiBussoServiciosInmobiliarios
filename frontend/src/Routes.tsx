import { Route, Routes as RoutesDom } from 'react-router-dom';

import { ROUTES } from './lib';
import Home from './pages/home';

export const Routes = () => {
    return (
        <RoutesDom>
            <Route path={ROUTES.HOME_APP} element={<Home />} />
        </RoutesDom>
    );
};
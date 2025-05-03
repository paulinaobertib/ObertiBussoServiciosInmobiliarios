import { Route, Routes as RoutesDom } from 'react-router-dom';

import { ROUTES } from './lib';
// import Home from './pages/home';
import CreatePropertyPage from './pages/CreateProperty/CreatePropertyPage';

export default function Routes() {
    return (
        <RoutesDom>
            {/* <Route path={ROUTES.HOME_APP} element={<Home />} /> */}
            <Route path={ROUTES.NEW_PROPERTY} element={<CreatePropertyPage />} />
        </RoutesDom>
    );
};

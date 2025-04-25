// const BASE_URL = import.meta.env.VITE_BASE_URL;
// console.log("Base URL del frontend:", BASE_URL);

export const ROUTES = {
  HOME_APP: '',
  NEW_PROPERTY: `/properties/new`,
  EDIT_PROPERTY: `/properties/:id/edit`,
  VIEW_PROPERTY: `/properties/:id`,
  LOGIN: `/login`,
};

export const PAGES = [
  { name: "Home App", url: ROUTES.HOME_APP },
  { name: "Nueva Propiedad", url: ROUTES.NEW_PROPERTY },
  { name: "Editar Propiedad", url: ROUTES.EDIT_PROPERTY },
  { name: "Ver Propiedad", url: ROUTES.VIEW_PROPERTY },
];

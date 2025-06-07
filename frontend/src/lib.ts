// const BASE_URL = import.meta.env.VITE_BASE_URL;
// console.log("Base URL del frontend:", BASE_URL);

export const ROUTES = {
  HOME_APP: "/",
  NEW_PROPERTY: `/properties/new`,
  EDIT_PROPERTY: `/properties/:id/edit`,
  LOGIN: `/login`,
  COMPARE: "/properties/compare",
  PROPERTY_DETAILS: "/properties/:id",
  ADMIN_PANEL: "/panel",
  PROPERTY_COMMENTS: "/properties/:id/comments",
  PROPERTY_MAINTENANCE: "/properties/:id/maintenance",
};

export const PAGES = [
  { name: "Home App", url: ROUTES.HOME_APP },
  { name: "Nueva Propiedad", url: ROUTES.NEW_PROPERTY },
  { name: "Editar Propiedad", url: ROUTES.EDIT_PROPERTY },
  { name: "Comparar Propiedades", url: ROUTES.COMPARE },
  { name: "Detalle de Propiedad", url: ROUTES.PROPERTY_DETAILS },
  { name: "Panel de Administrador", url: ROUTES.ADMIN_PANEL },
  { name: "Comentarios de Propiedad", url: ROUTES.PROPERTY_COMMENTS },
  { name: "Mantenimiento de Propiedad", url: ROUTES.PROPERTY_MAINTENANCE },
];

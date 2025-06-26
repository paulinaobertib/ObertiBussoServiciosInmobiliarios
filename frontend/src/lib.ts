export const ROUTES = {
  HOME_APP: "/",
  NEW_PROPERTY: `/properties/new`,
  EDIT_PROPERTY: `/properties/:id/edit`,
  COMPARE: "/properties/compare",
  PROPERTY_DETAILS: "/properties/:id",
  ADMIN_PANEL: "/panel",
  USER_PROFILE: "/profile",
  PROPERTY_COMMENTS: "/properties/:id/comments",
  PROPERTY_MAINTENANCE: "/properties/:id/maintenance",
  CONTACT: "/contact",
  NEWS: "/news",
  FAVORITES: "/favorites"
};

export const PAGES = [
  { name: "Home App", url: ROUTES.HOME_APP },
  { name: "Nueva Propiedad", url: ROUTES.NEW_PROPERTY },
  { name: "Editar Propiedad", url: ROUTES.EDIT_PROPERTY },
  { name: "Comparar Propiedades", url: ROUTES.COMPARE },
  { name: "Detalle de Propiedad", url: ROUTES.PROPERTY_DETAILS },
  { name: "Panel de Administrador", url: ROUTES.ADMIN_PANEL },
  { name: "Perfil de Usuario", url: ROUTES.USER_PROFILE },
  { name: "Comentarios de Propiedad", url: ROUTES.PROPERTY_COMMENTS },
  { name: "Mantenimiento de Propiedad", url: ROUTES.PROPERTY_MAINTENANCE },
  { name: "Contacto de la Inmobiliarioa", url: ROUTES.CONTACT },
  { name: "Noticias", url: ROUTES.NEWS },
  { name: "Favoritos", url: ROUTES.FAVORITES },

];

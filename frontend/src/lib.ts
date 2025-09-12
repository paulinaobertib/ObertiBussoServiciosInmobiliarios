export function buildRoute(template: string, param: string | number): string;
export function buildRoute(
  template: string,
  params: Record<string, string | number>
): string;
export function buildRoute(template: string, params: any): string {
  const map = typeof params === "object" ? params : { id: params };
  let path = template;
  for (const [key, value] of Object.entries(map)) {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  }
  return path;
}

export const ROUTES = {
  HOME_APP: "/",
  NEW_PROPERTY: `/properties/new`,
  EDIT_PROPERTY: `/properties/:id/edit`,
  COMPARE: "/properties/compare",
  PROPERTY_DETAILS: "/properties/:id",
  ADMIN_PAGE: "/admin",
  USER_PROFILE: "/profile",
  PROPERTY_COMMENTS: "/properties/:id/comments",
  PROPERTY_MAINTENANCE: "/properties/:id/maintenance",
  PROPERTY_NOTES: "/properties/:id/notes",
  CONTACT: "/contact",
  NEWS: "/news",
  NEWS_DETAILS: "/news/:id",
  FAVORITES: "/favorites",
  POLICIES: "/policies",
  SURVEY: "/survey/:inquiryId/:token",
  TENANT: "/tenant",
  CONTRACT: "/contract",
  NEW_CONTRACT: `/contract/new`,
  EDIT_CONTRACT: `/contract/:id/edit`,
  CONTRACT_UTILITIES: `/contract/:id/utilities`,
  CONTRACT_COMMISSION: `/contract/:id/commission`,
  APPOINTMENTS: "/appointments",
  STATS: "/stats",
  CONTRACT_DETAIL: "/contracts/:id",
  //CONTRACT_DETAIL_TENANT: "/users/contracts/:id"
};

export const PAGES = [
  { name: "Home App", url: ROUTES.HOME_APP },
  { name: "Nueva Propiedad", url: ROUTES.NEW_PROPERTY },
  { name: "Editar Propiedad", url: ROUTES.EDIT_PROPERTY },
  { name: "Comparar Propiedades", url: ROUTES.COMPARE },
  { name: "Detalle de Propiedad", url: ROUTES.PROPERTY_DETAILS },
  { name: "Panel de Administrador", url: ROUTES.ADMIN_PAGE },
  { name: "Perfil de Usuario", url: ROUTES.USER_PROFILE },
  { name: "Comentarios de Propiedad", url: ROUTES.PROPERTY_COMMENTS },
  { name: "Mantenimiento de Propiedad", url: ROUTES.PROPERTY_MAINTENANCE },
  { name: "Notas de la Propiedad", url: ROUTES.PROPERTY_NOTES },
  { name: "Contacto de la Inmobiliarioa", url: ROUTES.CONTACT },
  { name: "Noticias", url: ROUTES.NEWS },
  { name: "Detalle de Noticia", url: ROUTES.NEWS_DETAILS },
  { name: "Favoritos", url: ROUTES.FAVORITES },
  { name: "Politicas de Privacidad", url: ROUTES.POLICIES },
  { name: "Encuesta de Satisfaccion", url: ROUTES.SURVEY },
  { name: "Panel de Inquilino", url: ROUTES.TENANT },
  { name: "Panel de Gestión de Inquilinos", url: ROUTES.CONTRACT },
  { name: "Nuevo Contrato", url: ROUTES.NEW_CONTRACT },
  { name: "Editar Contrato", url: ROUTES.EDIT_CONTRACT },
  { name: "Utilidades del Contrato", url: ROUTES.CONTRACT_UTILITIES },
  { name: "Comision del Contrato", url: ROUTES.CONTRACT_COMMISSION },
  { name: "Turnero", url: ROUTES.APPOINTMENTS },
  { name: "Estadisticas", url: ROUTES.STATS },
];

const normalizeUrl = (value: string) => value.replace(/\/+$/, "");

const resolveServiceBaseUrl = () => {
  const envApiUrl = Cypress.env("apiUrl");
  if (typeof envApiUrl === "string" && envApiUrl.trim().length > 0) {
    return normalizeUrl(envApiUrl.trim());
  }

  const envGatewayUrl = Cypress.env("gatewayUrl");
  if (typeof envGatewayUrl === "string" && envGatewayUrl.trim().length > 0) {
    const rawPrefix = Cypress.env("gatewayApiPrefix");
    const prefix =
      typeof rawPrefix === "string" && rawPrefix.trim().length > 0 ? rawPrefix.trim() : "/api";

    const normalizedGateway = normalizeUrl(envGatewayUrl.trim());
    const normalizedPrefix = prefix.startsWith("/") ? prefix : `/${prefix}`;

    if (normalizedGateway.endsWith(normalizedPrefix)) {
      return normalizedGateway;
    }

    return `${normalizedGateway}${normalizedPrefix}`;
  }

  throw new Error("No se encontro apiUrl ni gatewayUrl configurado en Cypress env");
};

const normalizePath = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
};

export const buildGatewayUrl = (path: string) => {
  if (!path || typeof path !== "string") {
    throw new Error("El path para interceptGateway debe ser un string no vacío");
  }

  const base = resolveServiceBaseUrl();
  return `${base}${normalizePath(path)}`;
};

export const interceptGateway = (method: Cypress.HttpMethod, path: string, alias: string) =>
  cy.intercept(method, buildGatewayUrl(path)).as(alias);

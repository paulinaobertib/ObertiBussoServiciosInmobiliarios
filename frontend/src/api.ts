import axios, { AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true, // Manda cookies (SESSION + XSRF-TOKEN)
  // xsrfCookieName: "XSRF-TOKEN", // Lee esta cookie
  // xsrfHeaderName: "X-XSRF-TOKEN", // La envía en este header
});

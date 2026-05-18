export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login desativado temporariamente.
// Como o projeto não tem VITE_OAUTH_PORTAL_URL configurado,
// redirecionamos para a área de artigos para evitar erro "Invalid URL".
export const getLoginUrl = () => {
  return "/articles";
};
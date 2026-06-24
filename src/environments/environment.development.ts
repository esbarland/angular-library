export const environment = {
  production: false,
  // Préfixe `/api` : les appels (`/api/book`, `/api/book/{id}`...) passent par le
  // proxy du dev-server (proxy.conf.cjs), qui retire `/api` et relaie vers le
  // backend (http://localhost:8080 sous Windows via la passerelle WSL).
  // Préfixe dédié → pas de collision avec les routes Angular (/books).
  apiBaseUrl: '/api',
};

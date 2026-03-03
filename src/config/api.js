/**
 * Central API base URL.
 *
 * Production / Railway  →  VITE_API_URL is left empty ("") so all fetch
 *   calls use relative paths (/api/...) which are handled by the nginx
 *   gateway serving the frontend.
 *
 * Local dev without nginx  →  set VITE_API_URL=http://localhost in
 *   frontend/.env.local so calls reach the local nginx container.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default API_BASE;

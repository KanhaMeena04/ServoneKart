const rawUrl =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  process.env.VITE_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://servonekart.onrender.com"
    : "http://localhost:5000");

const API_BASE_URL = rawUrl.replace(/\/api(\/v1)?\/?$/, "").replace(/\/+$/, "");

const WEBSITE_URL = (
  process.env.REACT_APP_WEBSITE_URL ||
  process.env.VITE_WEBSITE_URL ||
  "https://tricelynwebsite.vercel.app"
).replace(/\/+$/, "");

const ADMIN_URL = (
  process.env.REACT_APP_ADMIN_URL ||
  process.env.VITE_ADMIN_URL ||
  "https://tricelynadmin.vercel.app"
).replace(/\/+$/, "");

export {
  API_BASE_URL,
  WEBSITE_URL,
  ADMIN_URL
};

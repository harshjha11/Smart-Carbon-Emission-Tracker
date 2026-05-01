const defaultApiUrl = import.meta.env.DEV ? "http://localhost:5000" : "";
const rawApiUrl = import.meta.env.VITE_API_URL?.trim() || defaultApiUrl;
const pointsToLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(rawApiUrl);

export const API_URL = import.meta.env.PROD && pointsToLocalhost
  ? ""
  : rawApiUrl.replace(/\/$/, "");

export const getMediaUrl = (value) => {
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  return `${API_URL}/${value.replace(/^\/+/, "")}`;
};

const LOGOUT_PENDING_KEY = "perplexity.logoutPending";

export const isLogoutPending = () =>
  window.localStorage.getItem(LOGOUT_PENDING_KEY) === "true";

export const setLogoutPending = () =>
  window.localStorage.setItem(LOGOUT_PENDING_KEY, "true");

export const clearLogoutPending = () =>
  window.localStorage.removeItem(LOGOUT_PENDING_KEY);

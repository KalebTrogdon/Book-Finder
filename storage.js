export function getLastQuery() {
  return localStorage.getItem('lastQuery') || '';
}
export function setLastQuery(q) {
  localStorage.setItem('lastQuery', q);
}

// Theme (dark/light)
export function getTheme() {
  return localStorage.getItem('theme');
}
export function setTheme(t) {
  localStorage.setItem('theme', t);
}

// URL state
export function readURLParams() {
  return new URLSearchParams(window.location.search);
}
export function writeURLParams(params) {
  const s = params.toString();
  history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
}

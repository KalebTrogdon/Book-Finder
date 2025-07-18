const API_KEY   = 'AIzaSyCGCRbof5m47ffDoge_zfZys1PjzW_pjzW_pj3A';
const BASE_URL  = 'https://www.googleapis.com/books/v1/volumes';
export const PAGE_SIZE = 20;

export async function fetchBooks(query, page = 1) {
  const startIndex = (page - 1) * PAGE_SIZE;
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}`
    + `&startIndex=${startIndex}&maxResults=${PAGE_SIZE}`
    + `&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

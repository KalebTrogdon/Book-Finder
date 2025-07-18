// main.js
import { fetchBooks }        from './api.js';
import { getLastQuery, setLastQuery, readURLParams, writeURLParams, getTheme, setTheme } from './storage.js';
import { renderBooks, renderPagination, clearResults, setPaginationState } from './ui.js';

let currentPage = 1, currentItems = [];

function initApp() {
  initDarkMode();
  initNav();
  initSearchForm();
  loadFromURL();
}
document.addEventListener('DOMContentLoaded', initApp);

function initNav() {
  document.getElementById('page-nav').onchange = e => {
    window.location.href = e.target.value;
  };
}

function initDarkMode() {
  const t = getTheme() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
  if (t==='dark') document.documentElement.classList.add('dark');
  const btn = document.getElementById('dark-toggle');
  btn.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'));
  btn.onclick = () => {
    const is = document.documentElement.classList.toggle('dark');
    btn.setAttribute('aria-pressed', is);
    setTheme(is ? 'dark' : 'light');
  };
}

function initSearchForm() {
  const form = document.getElementById('search-form');
  form.onsubmit = e => {
    e.preventDefault();
    const q = document.getElementById('search-input').value.trim();
    if (!q) return;
    setLastQuery(q);
    currentPage = 1;
    updateURL();
    doSearch();
  };
  document.getElementById('clear-search').onclick = () => {
    document.querySelectorAll('#search-input,#filter-title,#filter-author,#filter-genre,#sort-by')
      .forEach(i=>i.value='');
    clearResults();
    writeURLParams(new URLSearchParams());
  };
}

function loadFromURL() {
  const params = readURLParams();
  const q = params.get('q');
  if (q) document.getElementById('search-input').value = q;
  ['title','author','genre','sort','page'].forEach(k => {
    const v = params.get(k);
    if (v) {
      const el = document.getElementById(k==='sort'? 'sort-by' : `filter-${k}`);
      if (el) { el.value = v; }
      if (k==='page') currentPage = +v;
    }
  });
  if (q) doSearch();
}

function updateURL() {
  const params = readURLParams();
  const q = document.getElementById('search-input').value.trim();
  if (q) params.set('q', q); else params.delete('q');
  ['title','author','genre'].forEach(k => {
    const v = document.getElementById(`filter-${k}`).value.trim();
    if (v) params.set(k, v); else params.delete(k);
  });
  const s = document.getElementById('sort-by').value;
  if (s) params.set('sort', s); else params.delete('sort');
  if (currentPage>1) params.set('page', currentPage); else params.delete('page');
  writeURLParams(params);
}

async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  clearResults();
  try {
    const data = await fetchBooks(q, currentPage);
    currentItems = data.items || [];
    setPaginationState(data.totalItems||0, currentPage);
    let filtered = applyFilters(currentItems);
    filtered = applySort(filtered);
    renderBooks(filtered);
    renderPagination(
      () => { currentPage--; updateURL(); doSearch(); },
      page => { currentPage=page; updateURL(); doSearch(); },
      () => { currentPage++; updateURL(); doSearch(); }
    );
  } catch (err) {
    document.getElementById('results').innerHTML =
      `<p class="text-center text-red-600">Error: ${err.message}</p>`;
  }
}

function applyFilters(items) {
  const t = document.getElementById('filter-title').value.trim().toLowerCase();
  const a = document.getElementById('filter-author').value.trim().toLowerCase();
  const g = document.getElementById('filter-genre').value.trim().toLowerCase();
  return items.filter(i => {
    const vi = i.volumeInfo||{};
    return (!t||vi.title?.toLowerCase().includes(t))
        &&(!a||(vi.authors||[]).join().toLowerCase().includes(a))
        &&(!g||(vi.categories||[]).join().toLowerCase().includes(g));
  });
}

function applySort(items) {
  const key = document.getElementById('sort-by').value;
  if (!key) return items;
  return [...items].sort((u,v)=>{
    const ia=u.volumeInfo||{}, ib=v.volumeInfo||{};
    const va = (key==='author'? (ia.authors||[''])[0]: ia[key]||'').toLowerCase();
    const vb = (key==='author'? (ib.authors||[''])[0]: ib[key]||'').toLowerCase();
    return va.localeCompare(vb);
  });
}

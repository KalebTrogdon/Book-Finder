const API_KEY   = 'AIzaSyCGCRbof5m47ffDoge_zfZys1PjzW_pjzW_pj3A';
const BASE_URL  = 'https://www.googleapis.com/books/v1/volumes';
const PAGE_SIZE = 20;

let currentPage  = 1;
let totalItems   = 0;
let currentItems = [];

// ENTRY
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  initNav();
  initDarkMode();
  initForm();
  loadStateFromURL();
  const q = document.getElementById('search-input').value.trim();
  if (q) fetchAndRender();
}

// NAV DROPDOWN
function initNav() {
  document.getElementById('page-nav').onchange = e => {
    window.location.href = e.target.value;
  };
}

// DARK MODE TOGGLE
function initDarkMode() {
  const btn    = document.getElementById('dark-toggle');
  const stored = localStorage.getItem('theme')
                || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', stored);
  btn.setAttribute('aria-pressed', stored === 'dark');
  btn.addEventListener('click', () => {
    const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isCurrentlyDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    btn.setAttribute('aria-pressed', nextTheme === 'dark');
    localStorage.setItem('theme', nextTheme);
  });
}


// SEARCH FORM + CLEAR ALL
function initForm() {
  const form = document.getElementById('search-form');
  form.onsubmit = e => {
    e.preventDefault();
    currentPage = 1;
    updateURL();
    fetchAndRender();
  };
  document.getElementById('clear-search').onclick = () => {
    ['search-input','filter-title','filter-author','filter-genre','sort-by']
      .forEach(id => document.getElementById(id).value = '');
    clearResults();
    history.replaceState(null,'',window.location.pathname);
  };
}

// READ URL → populate inputs
function loadStateFromURL() {
  const p = new URLSearchParams(window.location.search);
  if (p.has('q'))   document.getElementById('search-input').value = p.get('q');
  ['title','author','genre'].forEach(k => {
    if (p.has(k)) document.getElementById(`filter-${k}`).value = p.get(k);
  });
  if (p.has('sort')) document.getElementById('sort-by').value = p.get('sort');
  if (p.has('page')) {
    const pg = parseInt(p.get('page'),10);
    if (!isNaN(pg) && pg>1) currentPage = pg;
  }
}

// UPDATE URL on each search/filter/sort/page
function updateURL() {
  const p = new URLSearchParams();
  const q = document.getElementById('search-input').value.trim();
  if (q) p.set('q',q);
  ['title','author','genre'].forEach(k => {
    const v = document.getElementById(`filter-${k}`).value.trim();
    if (v) p.set(k,v);
  });
  const s = document.getElementById('sort-by').value;
  if (s) p.set('sort',s);
  if (currentPage>1) p.set('page',currentPage);
  history.replaceState(null,'',`?${p}`);
}

// CLEAR RESULTS + PAGER
function clearResults() {
  document.getElementById('results').innerHTML = '';
  const old = document.getElementById('pager');
  if (old) old.remove();
}

// FETCH + RENDER
async function fetchAndRender() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  clearResults();
  document.getElementById('results').innerHTML = `<p class="col-span-2 text-center">Loading...</p>`;
  try {
    const start = (currentPage-1)*PAGE_SIZE;
    const url   = `${BASE_URL}?q=${encodeURIComponent(q)}`
                + `&startIndex=${start}&maxResults=${PAGE_SIZE}`
    const res   = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data  = await res.json();
    currentItems = data.items || [];
    totalItems   = data.totalItems || 0;
    let list     = applyFilters(currentItems);
    list         = applySort(list);
    renderBooks(list);
    renderPagination();
  } catch(err) {
    document.getElementById('results').innerHTML =
      `<p class="col-span-2 text-center text-red-600">Error: ${err.message}</p>`;
  }
}

// FILTERS
function applyFilters(items) {
  const t = document.getElementById('filter-title').value.trim().toLowerCase();
  const a = document.getElementById('filter-author').value.trim().toLowerCase();
  const g = document.getElementById('filter-genre').value.trim().toLowerCase();
  return items.filter(i => {
    const v = i.volumeInfo||{};
    return (!t || v.title?.toLowerCase().includes(t))
        && (!a || (v.authors||[]).join(',').toLowerCase().includes(a))
        && (!g || (v.categories||[]).join(',').toLowerCase().includes(g));
  });
}

// SORT
function applySort(items) {
  const key = document.getElementById('sort-by').value;
  if (!key) return items;
  return [...items].sort((u,v) => {
    const iu = u.volumeInfo||{}, iv = v.volumeInfo||{};
    const au = (key==='author'? (iu.authors||[''])[0] : iu[key]||'').toLowerCase();
    const av = (key==='author'? (iv.authors||[''])[0] : iv[key]||'').toLowerCase();
    return au.localeCompare(av);
  });
}

// RENDER BOOK CARDS
function renderBooks(items) {
  const rc = document.getElementById('results');
  rc.innerHTML = '';
  if (!items.length) {
    rc.innerHTML = '<p class="col-span-2 text-center">No books found.</p>';
    return;
  }
  items.forEach(i => {
    const v = i.volumeInfo||{};
    let img = v.imageLinks?.thumbnail||'';
    if (img.startsWith('http://')) img = img.replace(/^http:/,'https:');
    const desc = v.description?.replace(/<[^>]+>/g,'').slice(0,150)+'…'
               || 'No description available.';
    const card = document.createElement('div');
    card.className = 'book-card fade-in';
    card.innerHTML = `
      <img src="${img}" alt="Cover: ${v.title||'Untitled'}" class="w-full h-48 object-cover mb-4"/>
      <h2 class="font-semibold text-lg mb-2">${v.title||'Untitled'}</h2>
      <p class="text-sm text-gray-600 mb-1">${(v.authors||[]).join(', ')}</p>
      <p class="text-xs text-gray-500 mb-2">${v.publishedDate||''}</p>
      <p class="text-sm flex-grow">${(v.categories||[]).join(', ')}</p>
      <p class="text-sm">${desc}</p>
    `;
    rc.appendChild(card);
  });
}

// PAGINATION WITH SELECT
function renderPagination() {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages < 2) return;

  const pager = document.createElement('div');
  pager.id = 'pager';
  pager.className = 'my-4 flex justify-center items-center space-x-4';

  const prev = document.createElement('button');
  prev.textContent = 'Prev'; prev.disabled = currentPage===1;
  prev.className = 'px-3 py-1 border rounded';
  prev.onclick = () => { currentPage--; updateURL(); fetchAndRender(); };

  const sel = document.createElement('select');
  sel.className = 'p-1 border rounded';
  for (let i=1;i<=totalPages;i++){
    const o = new Option(`Page ${i}`,i);
    if (i===currentPage) o.selected=true;
    sel.add(o);
  }
  sel.onchange = () => {
    currentPage = +sel.value;
    updateURL(); fetchAndRender();
  };

  const next = document.createElement('button');
  next.textContent = 'Next'; next.disabled = currentPage===totalPages;
  next.className = 'px-3 py-1 border rounded';
  next.onclick = () => { currentPage++; updateURL(); fetchAndRender(); };

  pager.append(prev, sel, next);
  document.getElementById('results').after(pager);
}

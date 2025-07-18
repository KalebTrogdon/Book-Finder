const API_KEY = 'AIzaSyCGCRbof5m47ffDoge_zfZys1PjzW_pj3A';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const PAGE_SIZE = 20;
let currentPage = 1;
let totalItems = 0;
let currentItems = [];

// On DOM ready, initialize app
function initApp() {
  initDarkMode();
  loadStateFromURL();
  loadPersistedQuery();
  attachEventHandlers();

  // If there's a query in the input, perform search
  const q = document.getElementById('search-input').value.trim();
  if (q) {
    fetchPage(currentPage);
  }
}
document.addEventListener('DOMContentLoaded', initApp);

// Toggle dark/light mode and persist preference
function initDarkMode() {
  const toggle = document.getElementById('dark-toggle');
  const stored = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (stored === 'dark') document.documentElement.classList.add('dark');
  toggle.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'));
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    toggle.setAttribute('aria-pressed', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// Read search/filter/sort state from URL params
function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) document.getElementById('search-input').value = q;
  ['title', 'author', 'genre'].forEach(key => {
    const val = params.get(key);
    if (val) document.getElementById(`filter-${key}`).value = val;
  });
  const sort = params.get('sort');
  if (sort) document.getElementById('sort-by').value = sort;
  const page = parseInt(params.get('page'), 10);
  if (page > 1) currentPage = page;
}

// Persist last search query in localStorage
function loadPersistedQuery() {
  const last = localStorage.getItem('lastQuery');
  const input = document.getElementById('search-input');
  if (!input.value.trim() && last) input.value = last;
}
function persistQuery(q) {
  localStorage.setItem('lastQuery', q);
}

// Attach handlers for form, clear, filters, sort
function attachEventHandlers() {
  const form = document.getElementById('search-form');
  const clearAll = document.getElementById('clear-search');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = document.getElementById('search-input').value.trim();
    if (!q) return;
    persistQuery(q);
    currentPage = 1;
    updateURL();
    fetchPage(currentPage);
  });

  clearAll.addEventListener('click', () => {
    document.querySelectorAll('input,select').forEach(el => el.value = '');
    document.getElementById('results').innerHTML = '';
    removePager();
    history.replaceState(null, '', window.location.pathname);
  });

  document.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.clear;
      document.getElementById(id).value = '';
      updateURL();
      renderBooks(sorted(applyFilters(currentItems)));
    });
  });

  ['filter-title','filter-author','filter-genre'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      updateURL();
      renderBooks(sorted(applyFilters(currentItems)));
    });
  });

  document.getElementById('sort-by').addEventListener('change', () => {
    updateURL();
    renderBooks(sorted(applyFilters(currentItems)));
  });
}

// Update URL to reflect current state without reloading
function updateURL() {
  const params = new URLSearchParams();
  const q = document.getElementById('search-input').value.trim();
  if (q) params.set('q', q);
  ['title','author','genre'].forEach(key => {
    const val = document.getElementById(`filter-${key}`).value.trim();
    if (val) params.set(key, val);
  });
  const sort = document.getElementById('sort-by').value;
  if (sort) params.set('sort', sort);
  if (currentPage > 1) params.set('page', currentPage);
  history.replaceState(null, '', `${window.location.pathname}?${params}`);
}

// Fetch a page of books from Google Books API
async function fetchPage(page) {
  const query = document.getElementById('search-input').value.trim();
  const startIndex = (page - 1) * PAGE_SIZE;
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${PAGE_SIZE}&key=${API_KEY}`;
  const container = document.getElementById('results');
  container.innerHTML = '<p class="text-center">Loading...</p>';
  removePager();

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    currentItems = data.items || [];
    totalItems = data.totalItems || 0;
    renderBooks(sorted(applyFilters(currentItems)));
    renderPagination();
  } catch (err) {
    container.innerHTML = `<p class="text-center text-red-600">Error: ${err.message}</p>`;
  }
}

// Apply title/author/genre filters
function applyFilters(items) {
  const t = document.getElementById('filter-title').value.trim().toLowerCase();
  const a = document.getElementById('filter-author').value.trim().toLowerCase();
  const g = document.getElementById('filter-genre').value.trim().toLowerCase();
  return items.filter(item => {
    const info = item.volumeInfo || {};
    const title = (info.title || '').toLowerCase();
    const authors = (info.authors || []).join(', ').toLowerCase();
    const genres = (info.categories || []).join(', ').toLowerCase();
    return (!t || title.includes(t)) && (!a || authors.includes(a)) && (!g || genres.includes(g));
  });
}

// Sort filtered items by title/author/genre
function sorted(items) {
  const key = document.getElementById('sort-by').value;
  if (!key) return items;
  return [...items].sort((a, b) => {
    const ia = a.volumeInfo || {};
    const ib = b.volumeInfo || {};
    const va = key === 'author'
      ? (ia.authors||[''])[0].toLowerCase()
      : (ia[key]||'').toLowerCase();
    const vb = key === 'author'
      ? (ib.authors||[''])[0].toLowerCase()
      : (ib[key]||'').toLowerCase();
    return va.localeCompare(vb);
  });
}

// Render the list of books into the DOM
function renderBooks(items) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = '<p class="text-center">No books found.</p>';
    return;
  }
  items.forEach(item => {
    const info = item.volumeInfo || {};
    let img = info.imageLinks?.thumbnail || '';
    if (img.startsWith('http://')) {
      img = img.replace(/^http:\/\//, 'https://');
    }
    const desc = info.description
      ? info.description.replace(/<[^>]+>/g,'').slice(0,150) + '…'
      : 'No description available.';
    const card = document.createElement('div');
    card.className = 'book-card fade-in';
    card.innerHTML = `
      <img src="${img}" alt="Cover of ${info.title || 'Untitled'}" />
      <h2>${info.title || 'Untitled'}</h2>
      <p>${(info.authors || []).join(', ')}</p>
      <p class="small">${info.publishedDate || ''}</p>
      <p>${(info.categories || []).join(', ')}</p>
      <p class="desc">${desc}</p>
    `;
    container.appendChild(card);
  });
}

// Render pagination controls with Prev / dropdown / Next
function renderPagination() {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages < 2) return;
  const container = document.getElementById('results');
  const pager = document.createElement('div');
  pager.id = 'pager';
  pager.className = 'mt-4 flex justify-center items-center space-x-4';

  const prev = document.createElement('button');
  prev.textContent = 'Prev';
  prev.disabled = currentPage === 1;
  prev.className = 'px-3 py-1 border rounded';
  prev.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateURL();
      fetchPage(currentPage);
    }
  });

  const select = document.createElement('select');
  select.className = 'p-1 border rounded';
  for (let i = 1; i <= totalPages; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Page ${i}`;
    if (i === currentPage) opt.selected = true;
    select.appendChild(opt);
  }
  select.addEventListener('change', () => {
    currentPage = parseInt(select.value, 10);
    updateURL();
    fetchPage(currentPage);
  });

  const next = document.createElement('button');
  next.textContent = 'Next';
  next.disabled = currentPage === totalPages;
  next.className = 'px-3 py-1 border rounded';
  next.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateURL();
      fetchPage(currentPage);
    }
  });

  pager.append(prev, select, next);
  container.after(pager);
}

// Remove existing pagination controls
function removePager() {
  const old = document.getElementById('pager');
  if (old) old.remove();
}

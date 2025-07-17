const API_KEY = 'AIzaSyCGCRbof5m47ffDoge_zfZys1PjzW_pj3A';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const PAGE_SIZE = 20;
let currentPage = 1;
let totalItems = 0;
let currentItems = [];

function initApp() {
  initDarkMode();
  loadStateFromURL();
  loadPersistedQuery();
  attachEventHandlers();
  if (document.getElementById('search-input').value.trim()) {
    fetchPage(currentPage);
  }
}

document.addEventListener('DOMContentLoaded', initApp);

// Initialize dark/light mode based on localStorage or system
function initDarkMode() {
  const toggle = document.getElementById('dark-toggle');
  const stored = localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (stored === 'dark') document.documentElement.classList.add('dark');
  toggle.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'));
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    toggle.setAttribute('aria-pressed', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// Read and apply URL query parameters
function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) document.getElementById('search-input').value = q;
  ['title','author','genre'].forEach(key => {
    const val = params.get(key);
    if (val) document.getElementById(`filter-${key}`).value = val;
  });
  const sort = params.get('sort');
  if (sort) document.getElementById('sort-by').value = sort;
  const page = parseInt(params.get('page'), 10);
  if (page && page > 1) currentPage = page;
}

// Persist last search query to localStorage
function loadPersistedQuery() {
  const last = localStorage.getItem('lastQuery');
  const input = document.getElementById('search-input');
  if (!input.value.trim() && last) input.value = last;
}

function persistQuery(q) {
  localStorage.setItem('lastQuery', q);
}

// Set up all event handlers
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
    removePagination();
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

// Update browser URL without reload
function updateURL() {
  const params = new URLSearchParams();
  const q = document.getElementById('search-input').value.trim();
  if (q) params.set('q', q);
  ['title','author','genre'].forEach(key => {
    const v = document.getElementById(`filter-${key}`).value.trim();
    if (v) params.set(key, v);
  });
  const sort = document.getElementById('sort-by').value;
  if (sort) params.set('sort', sort);
  if (currentPage > 1) params.set('page', currentPage);
  history.replaceState(null, '', `${window.location.pathname}?${params}`);
}

// Fetch a page of results from Google Books API
async function fetchPage(page) {
  const query = document.getElementById('search-input').value.trim();
  const startIndex = (page - 1) * PAGE_SIZE;
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${PAGE_SIZE}&key=${API_KEY}`;
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '<p class="text-center">Loading...</p>';
  removePagination();

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    currentItems = data.items || [];
    totalItems = data.totalItems || 0;
    renderBooks(sorted(applyFilters(currentItems)));
    renderPagination();
  } catch (err) {
    resultsContainer.innerHTML = `<p class="text-center text-red-600">Error: ${err.message}</p>`;
  }
}

// Filter logic
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

// Sort logic
function sorted(items) {
  const key = document.getElementById('sort-by').value;
  if (!key) return items;
  return [...items].sort((a, b) => {
    const ia = a.volumeInfo || {};
    const ib = b.volumeInfo || {};
    const va = key === 'author' ? (ia.authors||[''])[0].toLowerCase() : (ia[key]||'').toLowerCase();
    const vb = key === 'author' ? (ib.authors||[''])[0].toLowerCase() : (ib[key]||'').toLowerCase();
    return va.localeCompare(vb);
  });
}

// Render books to DOM
function renderBooks(items) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = '<p class="text-center">No books found.</p>';
    return;
  }
  items.forEach(item => {
    const info = item.volumeInfo || {};
    const img = info.imageLinks?.thumbnail || '';
    const desc = info.description ? info.description.replace(/<[^>]+>/g,'').slice(0,150)+'…' : 'No description available.';
    const card = document.createElement('div');
    card.className = 'book-card fade-in';
    card.innerHTML = `
      <img src="${img}" alt="Cover" />
      <h2>${info.title||'Untitled'}</h2>
      <p>${(info.authors||[]).join(', ')}</p>
      <p class="small">${info.publishedDate||''}</p>
      <p>${(info.categories||[]).join(', ')}</p>
      <p class="desc">${desc}</p>
    `;
    container.appendChild(card);
  });
}

// Pagination controls (with dropdown selection)
function renderPagination() {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages < 2) return;
  const resultsContainer = document.getElementById('results');
  const pager = document.createElement('div');
  pager.id = 'pager';
  pager.className = 'mt-4 flex justify-center items-center space-x-4';

  // Prev button
  const prev = document.createElement('button');
  prev.id = 'prev';
  prev.textContent = 'Prev';
  prev.disabled = (currentPage === 1);
  prev.className = 'px-3 py-1 border rounded';
  prev.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateURL();
      fetchPage(currentPage);
    }
  });

  // Page selector dropdown
  const select = document.createElement('select');
  select.id = 'page-select';
  select.className = 'p-1 border rounded';
  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Page ${i}`;
    if (i === currentPage) option.selected = true;
    select.appendChild(option);
  }
  select.addEventListener('change', () => {
    currentPage = parseInt(select.value, 10);
    updateURL();
    fetchPage(currentPage);
  });

  // Next button
  const next = document.createElement('button');
  next.id = 'next';
  next.textContent = 'Next';
  next.disabled = (currentPage === totalPages);
  next.className = 'px-3 py-1 border rounded';
  next.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateURL();
      fetchPage(currentPage);
    }
  });

  // Assemble
  pager.appendChild(prev);
  pager.appendChild(select);
  pager.appendChild(next);
  resultsContainer.after(pager);
}

// Remove pager
function removePagination() {
  const old = document.getElementById('pager');
  if (old) old.remove();
}
function removePagination() {
  const old = document.getElementById('pager');
  if (old) old.remove();
}


```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us - Book Searcher</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class', theme: { extend: { fontFamily: { inter: ['Inter','sans-serif'] } } } };
  </script>
  <link href="main.css" rel="stylesheet">
</head>
<body class="min-h-screen bg-[#1B2A41] text-[#F5F3E7] font-inter p-8">

  <header class="mb-8 flex justify-between items-center">
    <h1 class="text-3xl font-bold">📚 Book Searcher</h1>
    <nav>
      <a href="index.html" class="text-sm hover:underline">Home</a>
    </nav>
  </header>

  <main class="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow fade-in">
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Us</h2>
    <form id="contact-form" novalidate class="space-y-4">
      <div>
        <label for="contact-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name<span class="text-red-500">*</span></label>
        <input type="text" id="contact-name" required aria-required="true"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#C8B06E] bg-[#F5F3E7] text-[#1B2A41]" />
        <p id="error-name" class="mt-1 text-red-600 text-sm hidden">Please enter your name.</p>
      </div>
      <div>
        <label for="contact-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email<span class="text-red-500">*</span></label>
        <input type="email" id="contact-email" required aria-required="true"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#C8B06E] bg-[#F5F3E7] text-[#1B2A41]" />
        <p id="error-email" class="mt-1 text-red-600 text-sm hidden">Please enter a valid email address.</p>
      </div>
      <div>
        <label for="contact-message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message<span class="text-red-500">*</span></label>
        <textarea id="contact-message" rows="4" required aria-required="true" minlength="10"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#C8B06E] bg-[#F5F3E7] text-[#1B2A41]"></textarea>
        <p id="error-message" class="mt-1 text-red-600 text-sm hidden">Message must be at least 10 characters.</p>
      </div>
      <button type="submit" id="contact-submit"
        class="bg-[#8C5E3C] text-white px-4 py-2 rounded hover:bg-[#C8B06E] transition">Send Message</button>
    </form>
  </main>

  <script type="module" src="contact.js"></script>
</body>
</html>

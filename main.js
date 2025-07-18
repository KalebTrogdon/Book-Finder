const API_KEY = 'AIzaSyCGCRbof5m47ffDoge_zfZys1PjzW_pj3A';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const PAGE_SIZE = 20;
let currentPage = 1;
let totalItems = 0;
let currentItems = [];

// On DOM ready, initialize app
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  loadStateFromURL();
  loadPersistedQuery();
  attachEventHandlers();

  // If there's a query in the input, perform search
  const q = document.getElementById('search-input').value.trim();
  if (q) {
    fetchPage(currentPage);
  }
});

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


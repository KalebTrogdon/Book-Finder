const API_KEY = 'AIzaSyCGCRbof5m47ffDoge_zfZys1PjzW_pj3A';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const PAGE_SIZE = 20;
let currentPage = 1;
let totalItems = 0;
let currentItems = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results');
    const filterTitle = document.getElementById('filter-title');
    const filterAuthor = document.getElementById('filter-author');
    const filterGenre = document.getElementById('filter-genre');
    const sortBy = document.getElementById('sort-by');

    // Create Clear All button
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear All';
    clearBtn.className = 'px-4 py-2 border rounded mb-4';
    form.prepend(clearBtn);

    clearBtn.addEventListener('click', () => {
        input.value = '';
        filterTitle.value = '';
        filterAuthor.value = '';
        filterGenre.value = '';
        sortBy.value = '';
        currentPage = 1;
        totalItems = 0;
        currentItems = [];
        resultsContainer.innerHTML = '';
        removePagination();
    });

    // Individual filter clear buttons
    document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.clear;
            document.getElementById(id).value = '';
            renderBooks(sorted(applyFilters(currentItems)));
        });
    });

    // Live filter and sort
    [filterTitle, filterAuthor, filterGenre].forEach(el =>
        el.addEventListener('input', () => renderBooks(sorted(applyFilters(currentItems))))
    );
    sortBy.addEventListener('change', () => renderBooks(sorted(applyFilters(currentItems))));

    // On form submit, fetch first page
    form.addEventListener('submit', event => {
        event.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        fetchPage(1);
    });
});

// Fetch a specific page of books
async function fetchPage(page) {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    currentPage = page;
    const startIndex = (page - 1) * PAGE_SIZE;
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${PAGE_SIZE}&key=${API_KEY}`;
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = '<p class="text-center">Loading...</p>';
    removePagination();

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();

        currentItems = data.items || [];
        totalItems = data.totalItems || 0;

        renderBooks(sorted(applyFilters(currentItems)));
        renderPagination();
    } catch (error) {
        resultsContainer.innerHTML = `<p class="text-center text-red-600">Error: ${error.message}</p>`;
    }
}

// Apply filters (title, author, genre)
function applyFilters(items) {
    const titleFilter = document.getElementById('filter-title').value.trim().toLowerCase();
    const authorFilter = document.getElementById('filter-author').value.trim().toLowerCase();
    const genreFilter = document.getElementById('filter-genre').value.trim().toLowerCase();

    return items.filter(item => {
        const info = item.volumeInfo || {};
        const title = (info.title || '').toLowerCase();
        const authors = (info.authors || []).join(', ').toLowerCase();
        const categories = (info.categories || []).join(', ').toLowerCase();
        return (
            (!titleFilter || title.includes(titleFilter)) &&
            (!authorFilter || authors.includes(authorFilter)) &&
            (!genreFilter || categories.includes(genreFilter))
        );
    });
}

// Sort items based on sortBy select
function sorted(items) {
    const key = document.getElementById('sort-by').value;
    if (!key) return items;

    return [...items].sort((a, b) => {
        const infoA = a.volumeInfo || {};
        const infoB = b.volumeInfo || {};
        const valA = (key === 'author')
            ? (infoA.authors || [''])[0].toLowerCase()
            : (infoA[key] || '').toLowerCase();
        const valB = (key === 'author')
            ? (infoB.authors || [''])[0].toLowerCase()
            : (infoB[key] || '').toLowerCase();
        return valA.localeCompare(valB);
    });
}

// Render book cards
function renderBooks(items) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (items.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center">No books found.</p>';
        return;
    }

    items.forEach(item => {
        const info = item.volumeInfo || {};
        const thumbnail = info.imageLinks?.thumbnail || '';
        const description = info.description
            ? info.description.replace(/<[^>]+>/g, '').slice(0, 150) + '…'
            : 'No description available.';

        const card = document.createElement('div');
        card.className = 'book-card fade-in';
        card.innerHTML = `
      <img src="${thumbnail}" alt="Cover" />
      <h2>${info.title || 'Untitled'}</h2>
      <p>${(info.authors || []).join(', ')}</p>
      <p class="small">${info.publishedDate || ''}</p>
      <p>${(info.categories || []).join(', ')}</p>
      <p class="desc">${description}</p>
    `;
        resultsContainer.appendChild(card);
    });
}

// Render pagination controls
function renderPagination() {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages < 2) return;

    const resultsContainer = document.getElementById('results');
    const pager = document.createElement('div');
    pager.id = 'pager';
    pager.className = 'mt-4 flex justify-center space-x-4';
    pager.innerHTML = `
    <button ${currentPage === 1 ? 'disabled' : ''} id="prev">Prev</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button ${currentPage === totalPages ? 'disabled' : ''} id="next">Next</button>
  `;

    resultsContainer.after(pager);

    pager.querySelector('#prev').addEventListener('click', () => {
        if (currentPage > 1) fetchPage(currentPage - 1);
    });
    pager.querySelector('#next').addEventListener('click', () => {
        if (currentPage < totalPages) fetchPage(currentPage + 1);
    });
}

// Remove existing pagination controls
function removePagination() {
    const oldPager = document.getElementById('pager');
    if (oldPager) oldPager.remove();
}

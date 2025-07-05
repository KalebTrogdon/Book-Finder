// main.js
// Client-side pagination (20 per page), filtering, and clear functionality

const API_KEY = 'AIzaSyCGCRbof5m47ffDoge_zfZys1PjzW_pj3A';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const pageSize = 20;
let currentPage = 1;
let lastItems = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const results = document.getElementById('results');
    const filterTitle = document.getElementById('filter-title');
    const filterAuthor = document.getElementById('filter-author');
    const filterGenre = document.getElementById('filter-genre');

    // Ensure visible text in input fields
    input.style.color = '#1B2A41';
    filterTitle.style.color = '#1B2A41';
    filterAuthor.style.color = '#1B2A41';
    filterGenre.style.color = '#1B2A41';

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'px-4 py-2 border rounded mb-4';
    form.appendChild(clearBtn);

    clearBtn.addEventListener('click', () => {
        input.value = '';
        [filterTitle, filterAuthor, filterGenre].forEach(f => f.value = '');
        lastItems = [];
        currentPage = 1;
        results.innerHTML = '';
        removePagination();
    });

    // Live filter: re-render current page
    [filterTitle, filterAuthor, filterGenre].forEach(el =>
        el.addEventListener('input', () => renderPage())
    );

    // Search submit: fetch up to 40 items
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const q = input.value.trim();
        if (!q) return;

        results.innerHTML = '<p class="text-center">Loading...</p>';
        removePagination();

        try {
            const url = `${BASE_URL}?q=${encodeURIComponent(q)}&maxResults=40&key=${API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();
            lastItems = data.items || [];
            currentPage = 1;
            renderPage();
        } catch (err) {
            results.innerHTML = `<p class="text-center text-red-600">Error: ${err.message}</p>`;
        }
    });
});

// Render current page with filters
function renderPage() {
    const filtered = applyFilters(lastItems);
    const start = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);
    renderBooks(pageItems);
    renderPagination(filtered.length);
}

// Filter helper
function applyFilters(items) {
    const t = document.getElementById('filter-title').value.trim().toLowerCase();
    const a = document.getElementById('filter-author').value.trim().toLowerCase();
    const g = document.getElementById('filter-genre').value.trim().toLowerCase();
    return items.filter(item => {
        const info = item.volumeInfo || {};
        const title = (info.title || '').toLowerCase();
        const authors = (info.authors || []).join(', ').toLowerCase();
        const categories = (info.categories || []).join(', ').toLowerCase();
        return (!t || title.includes(t)) && (!a || authors.includes(a)) && (!g || categories.includes(g));
    });
}

// Render list of books
function renderBooks(items) {
    const results = document.getElementById('results');
    results.innerHTML = '';
    if (!items.length) {
        results.innerHTML = '<p class="text-center">No books found.</p>';
        return;
    }
    items.forEach(item => {
        const info = item.volumeInfo || {};
        const thumb = info.imageLinks?.thumbnail || '';
        const desc = info.description
            ? info.description.replace(/<[^>]+>/g, '').slice(0, 150) + '…'
            : 'No description available.';
        const card = document.createElement('div');
        card.className = 'book-card fade-in';
        card.innerHTML = `
      <img src="${thumb}" alt="Cover" />
      <h2>${info.title || 'Untitled'}</h2>
      <p>${(info.authors || []).join(', ')}</p>
      <p class="small">${info.publishedDate || ''}</p>
      <p>${(info.categories || []).join(', ')}</p>
      <p class="desc">${desc}</p>
    `;
        results.appendChild(card);
    });
}

// Pagination controls
function renderPagination(totalCount) {
    removePagination();
    const totalPages = Math.ceil(totalCount / pageSize);
    if (totalPages < 2) return;

    const results = document.getElementById('results');
    const pager = document.createElement('div');
    pager.id = 'pager';
    pager.className = 'mt-4 flex justify-center space-x-4';
    pager.innerHTML = `
    <button ${currentPage === 1 ? 'disabled' : ''} id="prev">Prev</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button ${currentPage === totalPages ? 'disabled' : ''} id="next">Next</button>
  `;
    results.after(pager);
    pager.querySelector('#prev').onclick = () => { currentPage--; renderPage(); };
    pager.querySelector('#next').onclick = () => { currentPage++; renderPage(); };
}

// Clear old pager
function removePagination() {
    const old = document.getElementById('pager');
    if (old) old.remove();
}

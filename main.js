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
<<<<<<< HEAD
    const results = document.getElementById('results');
=======
    const resultsContainer = document.getElementById('results');
    const sortBy = document.getElementById('sort-by');
>>>>>>> f0223419cb8c18b815a4b01271f219a722003150
    const filterTitle = document.getElementById('filter-title');
    const filterAuthor = document.getElementById('filter-author');
    const filterGenre = document.getElementById('filter-genre');

<<<<<<< HEAD
    // Ensure visible text in input fields
    input.style.color = '#1B2A41';
    filterTitle.style.color = '#1B2A41';
    filterAuthor.style.color = '#1B2A41';
    filterGenre.style.color = '#1B2A41';
=======
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = input.value.trim();
        const titleFilterValue = filterTitle.value.trim();
        const authorFilterValue = filterAuthor.value.trim();
        const genreFilterValue = filterGenre.value.trim();

        const errors = [];

        if (query.length < 2) {
            errors.push("Seach must be at least 2 characters.");
        }

        if (titleFilterValue && titleFilterValue.length < 2) {
            errors.push("Title filter must be at least 2 charaters.");
        }

        if (authorFilterValue && authorFilterValue.length < 2) {
            errors.push("Author filter must be at least 2 characters.");
        }

        if (genreFilterValue && !/^[a-zA-Z\s]+$/.test(genreFilterValue)) {
            errors.push("Genre filter must contain only letters.");
        }

        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        if (!query) return;
>>>>>>> f0223419cb8c18b815a4b01271f219a722003150

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'px-4 py-2 border rounded mb-4';
    form.appendChild(clearBtn);

<<<<<<< HEAD
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
=======
        try {
            const url = `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=20&key=${API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(response.statusText);

            const data = await response.json();
            let items = data.items || [];

            // Apply filters
            const titleFilter = filterTitle.value.trim().toLowerCase();
            const authorFilter = filterAuthor.value.trim().toLowerCase();
            const genreFilter = filterGenre.value.trim().toLowerCase();

            items = items.filter(item => {
                const info = item.volumeInfo;
                const matchesTitle = !titleFilter || (info.title && info.title.toLowerCase().includes(titleFilter));
                const matchesAuthor = !authorFilter || (info.authors && info.authors.join(', ').toLowerCase().includes(authorFilter));
                const matchesGenre = !genreFilter || (info.categories && info.categories.join(', ').toLowerCase().includes(genreFilter));
                return matchesTitle && matchesAuthor && matchesGenre;
            });

            // Apply sorting
            const sortValue = sortBy.value;
            if (sortValue) {
                items.sort((a, b) => {
                    const infoA = a.volumeInfo;
                    const infoB = b.volumeInfo;

                    const getValue = (info, key) => {
                        if (key === 'title') return info.title || '';
                        if (key === 'author') return (info.authors || [''])[0];
                        if (key === 'genre') return (info.categories || [''])[0];
                        return '';
                    };

                    const valA = getValue(infoA, sortValue).toLowerCase();
                    const valB = getValue(infoB, sortValue).toLowerCase();

                    return valA.localeCompare(valB);
                });
            }

            renderBooks(items);
        } catch (err) {
            resultsContainer.innerHTML = `<p class="col-span-2 text-center text-red-600">Error: ${err.message}</p>`;
        }
    });

    function clearFilterSearch(id) {
        const input = document.getElementById(id);
        if (input) {
            input.value = '';             // Clear the input's text
            document.getElementById('search-form').dispatchEvent(new Event('submit'));
        }
    }

    document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-clear');
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
                document.getElementById('search-form').dispatchEvent(new Event('submit'));
            }
        });
    });




    function renderBooks(items) {
        resultsContainer.innerHTML = '';
        if (!items.length) {
            resultsContainer.innerHTML = '<p class="col-span-2 text-center">No books found.</p>';
            return;
>>>>>>> f0223419cb8c18b815a4b01271f219a722003150
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
<<<<<<< HEAD
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
=======
});
>>>>>>> f0223419cb8c18b815a4b01271f219a722003150

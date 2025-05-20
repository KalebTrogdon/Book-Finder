const API_KEY = 'AIzaSyCGCRbof5m47ffDoge_zfZys1PjzW_pj3A';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// DOM elements
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results');
    const filterTitle = document.getElementById('filter-title');
    const filterAuthor = document.getElementById('filter-author');
    const filterGenre = document.getElementById('filter-genre');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;

        resultsContainer.innerHTML = '<p class="col-span-2 text-center">Loading...</p>';

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

            renderBooks(items);
        } catch (err) {
            resultsContainer.innerHTML = `<p class="col-span-2 text-center text-red-600">Error: ${err.message}</p>`;
        }
    });

    function renderBooks(items) {
        resultsContainer.innerHTML = '';
        if (!items.length) {
            resultsContainer.innerHTML = '<p class="col-span-2 text-center">No books found.</p>';
            return;
        }

        items.forEach(item => {
            const info = item.volumeInfo;
            const thumbnail = info.imageLinks?.thumbnail || '';

            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded shadow flex flex-col';

            card.innerHTML = `
        <img src="${thumbnail}" alt="Book cover" class="w-full h-48 object-cover mb-4" />
        <h2 class="font-semibold text-lg mb-2">${info.title || 'No title'}</h2>
        <p class="text-sm text-gray-600 mb-1">${(info.authors || []).join(', ')}</p>
        <p class="text-xs text-gray-500 mb-2">${info.publishedDate || ''}</p>
        <p class="text-sm flex-grow">${(info.categories || []).join(', ')}</p>
      `;

            resultsContainer.appendChild(card);
        });
    }
});
import { PAGE_SIZE } from './api.js';

let totalItems = 0, currentPage = 1;

// Expose setters for pagination
export function setPaginationState(total, page) {
  totalItems = total; currentPage = page;
}

// Clear results
export function clearResults() {
  document.getElementById('results').innerHTML = '';
  const old = document.getElementById('pager');
  if (old) old.remove();
}

// Render list of books
export function renderBooks(items) {
  const rc = document.getElementById('results');
  rc.innerHTML = '';
  if (!items.length) {
    rc.innerHTML = '<p class="text-center">No books found.</p>';
    return;
  }
  items.forEach(b => {
    const info = b.volumeInfo || {};
    let img = info.imageLinks?.smallThumbnail || info.imageLinks?.thumbnail || '';
    if (img.startsWith('http://')) img = img.replace(/^http:\/\//, 'https://');
    const desc = info.description
      ? info.description.replace(/<[^>]+>/g, '').slice(0,150) + '…'
      : 'No description.';
    const card = document.createElement('div');
    card.className = 'book-card fade-in';
    card.innerHTML = `
      <img loading="lazy" src="${img}" alt="Cover of ${info.title||'Untitled'}"/>
      <h2>${info.title||'Untitled'}</h2>
      <p>${(info.authors||[]).join(', ')}</p>
      <p class="small">${info.publishedDate||''}</p>
      <p>${(info.categories||[]).join(', ')}</p>
      <p class="desc">${desc}</p>
    `;
    rc.appendChild(card);
  });
}

// Render pagination (with Prev, page‐select, Next)
export function renderPagination(onPrev, onPage, onNext) {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages < 2) return;

  const pager = document.createElement('div');
  pager.id = 'pager';
  pager.className = 'mt-4 flex justify-center items-center space-x-4';

  const prev = document.createElement('button');
  prev.textContent = 'Prev'; prev.disabled = currentPage===1;
  prev.className = 'px-3 py-1 border rounded';
  prev.onclick = onPrev;

  const select = document.createElement('select');
  select.className = 'p-1 border rounded';
  for (let i=1; i<=totalPages; i++) {
    const o = new Option(`Page ${i}`, i);
    if (i===currentPage) o.selected = true;
    select.add(o);
  }
  select.onchange = () => onPage(+select.value);

  const next = document.createElement('button');
  next.textContent = 'Next'; next.disabled = currentPage===totalPages;
  next.className = 'px-3 py-1 border rounded';
  next.onclick = onNext;

  pager.append(prev, select, next);
  document.getElementById('results').after(pager);
}

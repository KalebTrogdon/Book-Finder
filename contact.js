import { getTheme, setTheme } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDarkToggle();
  hydrateForm();
  document.getElementById('contact-form').onsubmit = handleSubmit;
});

function initNav() {
  document.getElementById('page-nav').onchange = e => {
    window.location.href = e.target.value;
  };
}

function initDarkToggle() {
  const stored = getTheme() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
  if (stored === 'dark') document.documentElement.classList.add('dark');
  const btn = document.getElementById('dark-toggle');
  btn.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'));
  btn.onclick = () => {
    const now = document.documentElement.classList.toggle('dark');
    btn.setAttribute('aria-pressed', now);
    setTheme(now ? 'dark' : 'light');
  };
}

function hydrateForm() {
  ['name','email','subject','message'].forEach(id => {
    const el = document.getElementById(id);
    el.value = localStorage.getItem(`contact_${id}`) || '';
    el.oninput = () => localStorage.setItem(`contact_${id}`, el.value);
  });
}

function handleSubmit(e) {
  e.preventDefault();
  let ok = true;

  // Name
  const nameEl = document.getElementById('name');
  if (nameEl.value.trim().length < 2) {
    ok = false; toggleError('name', true);
  } else toggleError('name', false);

  // Email
  const emailEl = document.getElementById('email');
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(emailEl.value)) {
    ok = false; toggleError('email', true);
  } else toggleError('email', false);

  // Message
  const msgEl = document.getElementById('message');
  if (msgEl.value.trim().length < 10) {
    ok = false; toggleError('message', true);
  } else toggleError('message', false);

  if (!ok) return;

  // Success: clear localStorage, form, show feedback
  ['name','email','subject','message'].forEach(id => localStorage.removeItem(`contact_${id}`));
  e.target.reset();
  const succ = document.getElementById('contact-success');
  succ.classList.add('opacity-100');
  setTimeout(() => succ.classList.remove('opacity-100'), 3000);
}

function toggleError(field, show) {
  document.getElementById(`${field}-error`).classList.toggle('hidden', !show);
}

import { getLastQuery, setLastQuery } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  populateForm();
  document.getElementById('contact-form').addEventListener('submit', handleSubmit);
});

function initNav() {
  document.getElementById('page-nav').onchange = e => {
    window.location.href = e.target.value;
  };
}

function populateForm() {
  ['name','email','subject','message'].forEach(id => {
    const v = localStorage.getItem(`contact_${id}`) || '';
    const el = document.getElementById(id);
    if (el) el.value = v;
    el?.addEventListener('input', () => {
      localStorage.setItem(`contact_${id}`, el.value);
    });
  });
}

function handleSubmit(ev) {
  ev.preventDefault();
  let valid = true;
  // Name
  const name = document.getElementById('name');
  if (name.value.trim().length < 2) {
    valid = false; toggleError('name', true);
  } else toggleError('name', false);
  // Email
  const email = document.getElementById('email');
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.value)) {
    valid = false; toggleError('email', true);
  } else toggleError('email', false);
  // Message
  const msg = document.getElementById('message');
  if (msg.value.trim().length < 10) {
    valid = false; toggleError('message', true);
  } else toggleError('message', false);

  if (!valid) return;

  // On success: clear storage & show animation
  ['name','email','subject','message'].forEach(id => localStorage.removeItem(`contact_${id}`));
  document.getElementById('contact-form').reset();

  const success = document.getElementById('contact-success');
  success.classList.add('opacity-100');
  setTimeout(()=> success.classList.remove('opacity-100'), 3000);
}

function toggleError(field, on) {
  document.getElementById(`${field}-error`).classList.toggle('hidden', !on);
}

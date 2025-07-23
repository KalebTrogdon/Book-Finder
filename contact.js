import { initNav, initDarkMode } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initDarkMode();
    hydrateForm();
    document.getElementById('contact-form').onsubmit = handleSubmit;
});

// HYDRATE FORM FROM localStorage
function hydrateForm() {
    ['name', 'email', 'subject', 'message'].forEach(id => {
        const el = document.getElementById(id);
        el.value = localStorage.getItem(`contact_${id}`) || '';
        el.oninput = () => localStorage.setItem(`contact_${id}`, el.value);
    });
}

// FORM SUBMIT + VALIDATION
function handleSubmit(e) {
    e.preventDefault();
    let valid = true;

    // Name ≥2 chars
    const nm = document.getElementById('name');
    if (nm.value.trim().length < 2) {
        toggleError('name', true);
        valid = false;
    } else toggleError('name', false);

    // Email format
    const em = document.getElementById('email');
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(em.value)) {
        toggleError('email', true);
        valid = false;
    } else toggleError('email', false);

    // Message ≥10 chars
    const msg = document.getElementById('message');
    if (msg.value.trim().length < 10) {
        toggleError('message', true);
        valid = false;
    } else toggleError('message', false);

    if (!valid) return;

    // Success: wipe out storage, reset form, show animation
    ['name', 'email', 'subject', 'message'].forEach(id =>
        localStorage.removeItem(`contact_${id}`)
    );
    e.target.reset();
    const success = document.getElementById('contact-success');
    success.classList.add('opacity-100');
    setTimeout(() => success.classList.remove('opacity-100'), 3000);
}

function toggleError(field, show) {
    document.getElementById(`${field}-error`)
        .classList.toggle('hidden', !show);
}

export function loadContactData() {
  ['Name','Email','Message'].forEach(key => {
    const el = document.getElementById(`contact-${key.toLowerCase()}`);
    const saved = localStorage.getItem(`contact${key}`);
    if (saved) el.value = saved;
  });
}

export function validateContactForm() {
  let valid = true;
  const name = document.getElementById('contact-name');
  const email = document.getElementById('contact-email');
  const msg = document.getElementById('contact-message');
  document.getElementById('error-name').classList.toggle('hidden', !!name.value.trim());
  document.getElementById('error-email').classList.toggle('hidden', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
  document.getElementById('error-message').classList.toggle('hidden', msg.value.trim().length>=10);
  return name.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) && msg.value.trim().length>=10;
}

export function saveContactData() {
  localStorage.setItem('contactName', document.getElementById('contact-name').value.trim());
  localStorage.setItem('contactEmail', document.getElementById('contact-email').value.trim());
  localStorage.setItem('contactMessage', document.getElementById('contact-message').value.trim());
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  loadContactData();
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateContactForm()) return;
    saveContactData();
    alert(`Thanks, ${document.getElementById('contact-name').value.trim()}! Your message has been saved.`);
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', initContactForm);

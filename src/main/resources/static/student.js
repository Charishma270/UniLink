const API_BASE = '/api';
const STORAGE_KEY = 'unilink.user';

const eventsGrid = document.getElementById('events');
const searchInput = document.getElementById('search');
const count = document.getElementById('count');

const tagClassMap = {
  community: 'is-pink',
  performance: 'is-pink',
  creative: 'is-pink',
  sustainability: 'is-amber',
  innovation: 'is-amber',
  tournament: 'is-amber'
};

function getUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function ensureStudent() {
  const user = getUser();
  if (!user || user.role !== 'STUDENT') {
    window.location.href = 'studentlogin.html';
    return null;
  }
  return user;
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dateValue)) {
    const date = new Date(`${dateValue}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }
  return dateValue;
}

function formatTime(timeValue) {
  if (!timeValue) return '';
  if (/^\\d{2}:\\d{2}(:\\d{2})?$/.test(timeValue)) {
    const date = new Date(`1970-01-01T${timeValue}`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  }
  return timeValue;
}

let events = [];

async function loadEvents() {
  const response = await fetch(`${API_BASE}/events?status=PUBLISHED`);
  if (!response.ok) {
    throw new Error('Unable to load events.');
  }
  const data = await response.json();
  return data.map((event) => ({
    ...event,
    date: formatDate(event.date),
    time: formatTime(event.time)
  }));
}

function matchesQuery(event, query) {
  if (!query) return true;
  const haystack = [
    event.club,
    event.title,
    event.location,
    event.description,
    ...(event.tags || [])
  ].join(' ').toLowerCase();
  return haystack.includes(query);
}

function renderEvents(list) {
  eventsGrid.innerHTML = '';

  if (!list.length) {
    eventsGrid.innerHTML = '<p class="empty">No events match your search yet.</p>';
    count.textContent = '0 events';
    return;
  }

  list.forEach((event, index) => {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.style.animationDelay = `${index * 0.04}s`;

    const tags = (event.tags || [])
      .map((tag) => {
        const extraClass = tagClassMap[tag] ? ` ${tagClassMap[tag]}` : '';
        return `<span class="tag${extraClass}">${tag}</span>`;
      })
      .join('');

    card.innerHTML = `
      <div class="event-card__club">${event.club}</div>
      <h2 class="event-card__title">${event.title}</h2>
      <div class="event-card__meta">
        <span>${event.date || ''}</span>
        <span>${event.time || ''}</span>
        <span>${event.location}</span>
      </div>
      <p class="event-card__desc">${event.description}</p>
      <div class="event-card__tags">${tags}</div>
    `;

    eventsGrid.appendChild(card);
  });

  count.textContent = `${list.length} events`;
}

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  const filtered = events.filter((item) => matchesQuery(item, query));
  renderEvents(filtered);
});

async function init() {
  if (!ensureStudent()) return;
  try {
    events = await loadEvents();
    renderEvents(events);
  } catch (error) {
    events = [];
    renderEvents(events);
  }
}

init();

const API_BASE = '/api';
const STORAGE_KEY = 'unilink.user';

const form = document.getElementById('eventForm');
const list = document.getElementById('eventList');
const summary = document.getElementById('summary');
const formMessage = document.getElementById('formMessage');

function getUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function ensureEventManager() {
  const user = getUser();
  if (!user || user.role !== 'EVENT_MANAGER') {
    window.location.href = 'eventmanagerlogin.html';
    return null;
  }
  return user;
}

function formatTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  return dateValue;
}

function formatTime(timeValue) {
  if (!timeValue) return '';
  const date = new Date(`1970-01-01T${timeValue}`);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }
  return timeValue;
}

function setFormMessage(text) {
  formMessage.textContent = text;
}

async function fetchEvents(userId) {
  const response = await fetch(`${API_BASE}/events?createdById=${userId}`);
  if (!response.ok) {
    throw new Error('Unable to load events.');
  }
  return response.json();
}

async function createEvent(payload) {
  const response = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Unable to submit event.');
  }
  return response.json();
}

async function removeEvent(id, userId) {
  const response = await fetch(`${API_BASE}/events/${id}?requesterId=${userId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Unable to remove event.');
  }
}

let events = [];

function render() {
  list.innerHTML = '';
  if (!events.length) {
    list.innerHTML = '<p class="empty">No event posts yet. Start by creating one above.</p>';
    summary.textContent = '0 events';
    return;
  }

  const pendingCount = events.filter((event) => event.status === 'PENDING').length;
  const publishedCount = events.filter((event) => event.status === 'PUBLISHED').length;
  summary.textContent = `${events.length} events · ${pendingCount} pending · ${publishedCount} published`;

  events
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .forEach((event) => {
      const card = document.createElement('article');
      card.className = 'event-card';

      const tags = (event.tags || [])
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join('');

      const statusLabel = event.status === 'PUBLISHED' ? 'Published' : 'Pending Review';
      const statusClass = event.status === 'PUBLISHED' ? 'status is-published' : 'status';

      card.innerHTML = `
        <div class="event-card__club">${event.club}</div>
        <h3 class="event-card__title">${event.title}</h3>
        <div class="event-card__meta">
          <span>${formatDate(event.date)}</span>
          <span>${formatTime(event.time)}</span>
          <span>${event.location}</span>
        </div>
        <p class="event-card__desc">${event.description}</p>
        <div class="event-card__tags">${tags}</div>
        <div class="event-card__footer">
          <span class="${statusClass}">${statusLabel}</span>
          <button class="ghost" type="button" data-action="remove" data-id="${event.id}">Remove</button>
        </div>
      `;

      list.appendChild(card);
    });
}

async function refresh(userId) {
  events = await fetchEvents(userId);
  render();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const user = ensureEventManager();
  if (!user) return;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const newEvent = {
    club: data.club.trim(),
    title: data.title.trim(),
    date: data.date,
    time: data.time,
    location: data.location.trim(),
    description: data.description.trim(),
    tags: data.tags ? formatTags(data.tags) : [],
    createdById: user.id
  };

  if (!newEvent.club || !newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.description) {
    setFormMessage('Please complete all required fields before submitting.');
    return;
  }

  try {
    await createEvent(newEvent);
    form.reset();
    setFormMessage('Event submitted for admin review.');
    await refresh(user.id);
  } catch (error) {
    setFormMessage(error.message);
  }
});

list.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const user = ensureEventManager();
  if (!user) return;

  if (button.dataset.action === 'remove') {
    try {
      await removeEvent(button.dataset.id, user.id);
      await refresh(user.id);
    } catch (error) {
      setFormMessage(error.message);
    }
  }
});

async function init() {
  const user = ensureEventManager();
  if (!user) return;
  try {
    await refresh(user.id);
  } catch (error) {
    list.innerHTML = '<p class="empty">Unable to load events right now.</p>';
    summary.textContent = '0 events';
  }
}

init();

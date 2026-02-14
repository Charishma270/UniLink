const API_BASE = '/api';
const STORAGE_KEY = 'unilink.user';

const pendingList = document.getElementById('pendingList');
const recentList = document.getElementById('recentList');
const summary = document.getElementById('summary');

function getUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function ensureAdmin() {
  const user = getUser();
  if (!user || user.role !== 'ADMIN') {
    window.location.href = 'adminlogin.html';
    return null;
  }
  return user;
}

async function fetchEvents(status) {
  const response = await fetch(`${API_BASE}/events?status=${status}`);
  if (!response.ok) {
    throw new Error('Unable to load events.');
  }
  return response.json();
}

async function updateStatus(id, status) {
  const response = await fetch(`${API_BASE}/events/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    throw new Error('Unable to update status.');
  }
  return response.json();
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

function formatTags(tags) {
  return (tags || []).map((tag) => `<span class="tag">${tag}</span>`).join('');
}

function renderList(target, list, showActions) {
  target.innerHTML = '';
  if (!list.length) {
    target.innerHTML = '<p class="empty">No items right now.</p>';
    return;
  }

  list.forEach((event) => {
    const card = document.createElement('article');
    card.className = 'event-card';

    const actions = showActions
      ? `
        <div class="event-card__actions">
          <button class="action action--approve" data-action="approve" data-id="${event.id}">Approve</button>
          <button class="action action--reject" data-action="reject" data-id="${event.id}">Reject</button>
        </div>
      `
      : `<span class="status${event.status === 'REJECTED' ? ' is-rejected' : ''}">${event.status}</span>`;

    card.innerHTML = `
      <div class="event-card__club">${event.club}</div>
      <h3 class="event-card__title">${event.title}</h3>
      <div class="event-card__meta">
        <span>${formatDate(event.date)}</span>
        <span>${formatTime(event.time)}</span>
        <span>${event.location}</span>
      </div>
      <p class="event-card__desc">${event.description}</p>
      <div class="event-card__tags">${formatTags(event.tags)}</div>
      ${actions}
    `;

    target.appendChild(card);
  });
}

async function refresh() {
  const pending = await fetchEvents('PENDING');
  const published = await fetchEvents('PUBLISHED');
  const rejected = await fetchEvents('REJECTED');

  summary.textContent = `${pending.length} pending · ${published.length} published · ${rejected.length} rejected`;
  renderList(pendingList, pending, true);
  const recent = [...published.slice(0, 2), ...rejected.slice(0, 2)];
  renderList(recentList, recent, false);
}

pendingList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  ensureAdmin();
  const id = button.dataset.id;
  const action = button.dataset.action;

  try {
    await updateStatus(id, action === 'approve' ? 'PUBLISHED' : 'REJECTED');
    await refresh();
  } catch (error) {
    // Ignore for now
  }
});

async function init() {
  if (!ensureAdmin()) return;
  try {
    await refresh();
  } catch (error) {
    pendingList.innerHTML = '<p class="empty">Unable to load events right now.</p>';
    recentList.innerHTML = '<p class="empty">Unable to load events right now.</p>';
    summary.textContent = '0 pending';
  }
}

init();

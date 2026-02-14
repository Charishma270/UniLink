const STORAGE_KEY = 'unilink.events';

const pendingList = document.getElementById('pendingList');
const recentList = document.getElementById('recentList');
const summary = document.getElementById('summary');

function loadEvents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

let events = loadEvents();

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
      : `<span class="status${event.status === 'rejected' ? ' is-rejected' : ''}">${event.status}</span>`;

    card.innerHTML = `
      <div class="event-card__club">${event.club}</div>
      <h3 class="event-card__title">${event.title}</h3>
      <div class="event-card__meta">
        <span>${event.date}</span>
        <span>${event.time}</span>
        <span>${event.location}</span>
      </div>
      <p class="event-card__desc">${event.description}</p>
      <div class="event-card__tags">${formatTags(event.tags)}</div>
      ${actions}
    `;

    target.appendChild(card);
  });
}

function render() {
  const pending = events.filter((event) => event.status === 'pending');
  const published = events.filter((event) => event.status === 'published');
  const rejected = events.filter((event) => event.status === 'rejected');

  summary.textContent = `${pending.length} pending · ${published.length} published · ${rejected.length} rejected`;
  renderList(pendingList, pending, true);
  const recent = [...published.slice(0, 2), ...rejected.slice(0, 2)];
  renderList(recentList, recent, false);
}

pendingList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;

  events = events.map((item) => {
    if (item.id !== id) return item;
    if (action === 'approve') {
      return { ...item, status: 'published' };
    }
    if (action === 'reject') {
      return { ...item, status: 'rejected' };
    }
    return item;
  });

  saveEvents(events);
  render();
});

render();

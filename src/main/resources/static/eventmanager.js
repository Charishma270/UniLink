const STORAGE_KEY = 'unilink.events';

const form = document.getElementById('eventForm');
const list = document.getElementById('eventList');
const summary = document.getElementById('summary');
const formMessage = document.getElementById('formMessage');

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

function createId() {
  return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

let events = loadEvents();

function render() {
  list.innerHTML = '';
  if (!events.length) {
    list.innerHTML = '<p class="empty">No event posts yet. Start by creating one above.</p>';
    summary.textContent = '0 events';
    return;
  }

  const pendingCount = events.filter((event) => event.status === 'pending').length;
  const publishedCount = events.filter((event) => event.status === 'published').length;
  summary.textContent = `${events.length} events · ${pendingCount} pending · ${publishedCount} published`;

  events
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .forEach((event) => {
      const card = document.createElement('article');
      card.className = 'event-card';

      const tags = (event.tags || [])
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join('');

      const statusLabel = event.status === 'published' ? 'Published' : 'Pending Review';
      const statusClass = event.status === 'published' ? 'status is-published' : 'status';

      card.innerHTML = `
        <div class="event-card__club">${event.club}</div>
        <h3 class="event-card__title">${event.title}</h3>
        <div class="event-card__meta">
          <span>${event.date}</span>
          <span>${event.time}</span>
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

function setFormMessage(text) {
  formMessage.textContent = text;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const newEvent = {
    id: createId(),
    club: data.club.trim(),
    title: data.title.trim(),
    date: data.date,
    time: data.time,
    location: data.location.trim(),
    description: data.description.trim(),
    tags: data.tags ? formatTags(data.tags) : [],
    status: 'pending',
    createdAt: Date.now()
  };

  if (!newEvent.club || !newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.description) {
    setFormMessage('Please complete all required fields before submitting.');
    return;
  }

  events = [newEvent, ...events];
  saveEvents(events);
  form.reset();
  setFormMessage('Event submitted for admin review.');
  render();
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  if (button.dataset.action === 'remove') {
    events = events.filter((item) => item.id !== id);
    saveEvents(events);
    render();
  }
});

render();

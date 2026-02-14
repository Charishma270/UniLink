const STORAGE_KEY = 'unilink.events';

const seedEvents = [
  {
    club: 'Robotics Club',
    title: 'Build Night: Line-Follower Challenge',
    date: 'February 20, 2026',
    time: '6:30 PM',
    location: 'Innovation Lab 2B',
    description: 'Team up to design and test line-following robots with live mentorship.',
    tags: ['engineering', 'hardware', 'competition']
  },
  {
    club: 'Music Society',
    title: 'Open Mic: Acoustic Showcase',
    date: 'February 22, 2026',
    time: '7:00 PM',
    location: 'Student Union Terrace',
    description: 'A relaxed evening of unplugged performances and collaborative jam sessions.',
    tags: ['music', 'community', 'performance']
  },
  {
    club: 'Literature Circle',
    title: 'Poetry Slam and Story Night',
    date: 'February 24, 2026',
    time: '5:30 PM',
    location: 'Library Atrium',
    description: 'Share original poetry or short fiction and connect with campus writers.',
    tags: ['writing', 'open-mic', 'creative']
  },
  {
    club: 'Environmental Club',
    title: 'Sustainability Hack',
    date: 'February 26, 2026',
    time: '3:00 PM',
    location: 'Green Hub Studio',
    description: 'Brainstorm and prototype eco-friendly initiatives for campus living.',
    tags: ['sustainability', 'innovation', 'teamwork']
  },
  {
    club: 'Entrepreneurship Cell',
    title: 'Startup Sprint: Pitch Lab',
    date: 'March 1, 2026',
    time: '4:00 PM',
    location: 'Business Incubator',
    description: 'Refine your startup pitch with feedback from mentors and alumni.',
    tags: ['startup', 'pitch', 'networking']
  },
  {
    club: 'Art & Design Studio',
    title: 'Digital Illustration Jam',
    date: 'March 3, 2026',
    time: '2:00 PM',
    location: 'Design Lab 1A',
    description: 'Bring your tablet and create themed illustrations with guided prompts.',
    tags: ['art', 'design', 'workshop']
  },
  {
    club: 'Sports Council',
    title: 'Night League: 3v3 Basketball',
    date: 'March 5, 2026',
    time: '8:00 PM',
    location: 'Main Court',
    description: 'Fast-paced 3v3 games with live music and team sign-ups onsite.',
    tags: ['sports', 'fitness', 'tournament']
  },
  {
    club: 'Coding Guild',
    title: 'AI Study Jam',
    date: 'March 7, 2026',
    time: '6:00 PM',
    location: 'Tech Lounge',
    description: 'Hands-on deep dive into ML workflows and collaborative coding sessions.',
    tags: ['tech', 'ai', 'coding']
  }
];

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
  if (/^\\d{2}:\\d{2}$/.test(timeValue)) {
    const date = new Date(`1970-01-01T${timeValue}:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  }
  return timeValue;
}

function loadStoredEvents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((event) => event.status === 'published')
      .map((event) => ({
        club: event.club,
        title: event.title,
        date: formatDate(event.date),
        time: formatTime(event.time),
        location: event.location,
        description: event.description,
        tags: Array.isArray(event.tags) ? event.tags : []
      }));
  } catch (error) {
    return [];
  }
}

const events = [...loadStoredEvents(), ...seedEvents];

function matchesQuery(event, query) {
  if (!query) return true;
  const haystack = [
    event.club,
    event.title,
    event.location,
    event.description,
    ...event.tags
  ].join(' ').toLowerCase();
  return haystack.includes(query);
}

function renderEvents(list) {
  eventsGrid.innerHTML = '';

  if (!list.length) {
    eventsGrid.innerHTML = '<p class=\"empty\">No events match your search yet.</p>';
    count.textContent = '0 events';
    return;
  }

  list.forEach((event, index) => {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.style.animationDelay = `${index * 0.04}s`;

    const tags = event.tags
      .map((tag) => {
        const extraClass = tagClassMap[tag] ? ` ${tagClassMap[tag]}` : '';
        return `<span class=\"tag${extraClass}\">${tag}</span>`;
      })
      .join('');

    card.innerHTML = `
      <div class=\"event-card__club\">${event.club}</div>
      <h2 class=\"event-card__title\">${event.title}</h2>
      <div class=\"event-card__meta\">
        <span>${event.date}</span>
        <span>${event.time}</span>
        <span>${event.location}</span>
      </div>
      <p class=\"event-card__desc\">${event.description}</p>
      <div class=\"event-card__tags\">${tags}</div>
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

renderEvents(events);

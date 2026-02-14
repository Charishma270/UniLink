const cards = document.querySelectorAll('.card');
const status = document.getElementById('status');

const roleMap = {
  student: 'Student Portal selected.',
  event: 'Event Manager tools selected.',
  admin: 'Admin Console selected.'
};

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const role = card.dataset.role;
    cards.forEach((item) => item.classList.remove('is-active'));
    card.classList.add('is-active');
    status.textContent = roleMap[role] || 'Role selected.';

    if (role === 'student') {
      window.location.href = 'studentlogin.html';
    }

    if (role === 'event') {
      window.location.href = 'eventmanagerlogin.html';
    }

    if (role === 'admin') {
      window.location.href = 'adminlogin.html';
    }
  });
});

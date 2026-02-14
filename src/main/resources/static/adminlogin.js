const form = document.getElementById('loginForm');
const message = document.getElementById('message');
const allowedDomain = '@srkrec.edu.in';

function setMessage(text, type) {
  message.textContent = text;
  message.classList.remove('is-error', 'is-success');
  if (type) {
    message.classList.add(type);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value.trim();

  if (!email || !password) {
    setMessage('Please enter your admin email and password.', 'is-error');
    return;
  }

  if (!email.endsWith(allowedDomain)) {
    setMessage(`Use your ${allowedDomain} email to continue.`, 'is-error');
    return;
  }

  setMessage('Login successful. Redirecting...', 'is-success');
  setTimeout(() => {
    window.location.href = 'admin.html';
  }, 700);
});

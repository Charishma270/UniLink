const form = document.getElementById('loginForm');
const message = document.getElementById('message');
const allowedDomain = '@srkrec.ac.in';
const STORAGE_KEY = 'unilink.user';

function setMessage(text, type) {
  message.textContent = text;
  message.classList.remove('is-error', 'is-success');
  if (type) {
    message.classList.add(type);
  }
}

function saveUser(data) {
  const payload = {
    id: data.userId,
    email: data.email,
    role: data.role,
    name: data.name
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    let errorMessage = 'Login failed. Please check your credentials.';
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (error) {
      // ignore parsing errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

form.addEventListener('submit', async (event) => {
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

  try {
    const data = await login(email, password);
    if (data.role !== 'ADMIN') {
      setMessage('This account is not registered as an admin.', 'is-error');
      return;
    }
    saveUser(data);
    setMessage('Login successful. Redirecting...', 'is-success');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 500);
  } catch (error) {
    setMessage(error.message, 'is-error');
  }
});

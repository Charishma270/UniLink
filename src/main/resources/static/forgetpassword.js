const requestForm = document.getElementById('requestForm');
const resetForm = document.getElementById('resetForm');
const requestMessage = document.getElementById('requestMessage');
const resetMessage = document.getElementById('resetMessage');
const emailPreview = document.getElementById('emailPreview');
const sendButton = requestForm.querySelector('button[type="submit"]');

const allowedDomain = '@srkrec.ac.in';
let currentEmail = '';
let cooldownTimer = null;
let cooldownRemaining = 0;

function setMessage(target, text, type) {
  target.textContent = text;
  target.classList.remove('is-error', 'is-success');
  if (type) {
    target.classList.add(type);
  }
}

async function sendOtp(email) {
  const response = await fetch('/api/password/forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    let errorMessage = 'Unable to send OTP. Please try again.';
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

  const data = await response.json();
  return data.message || 'OTP sent. Check your email.';
}

async function resetPassword(payload) {
  const response = await fetch('/api/password/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorMessage = 'Unable to reset password.';
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

  const data = await response.json();
  return data.message || 'Password updated successfully.';
}

function startCooldown(seconds) {
  if (!sendButton) return;
  cooldownRemaining = seconds;
  sendButton.disabled = true;
  sendButton.textContent = `Resend in ${cooldownRemaining}s`;

  if (cooldownTimer) {
    clearInterval(cooldownTimer);
  }

  cooldownTimer = setInterval(() => {
    cooldownRemaining -= 1;
    if (cooldownRemaining <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      sendButton.disabled = false;
      sendButton.textContent = 'Send OTP';
      return;
    }
    sendButton.textContent = `Resend in ${cooldownRemaining}s`;
  }, 1000);
}

requestForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (sendButton && sendButton.disabled) {
    return;
  }

  const email = requestForm.email.value.trim();
  if (!email) {
    setMessage(requestMessage, 'Please enter your email address.', 'is-error');
    return;
  }
  if (!email.endsWith(allowedDomain)) {
    setMessage(requestMessage, `Use your ${allowedDomain} email.`, 'is-error');
    return;
  }

  try {
    const message = await sendOtp(email);
    currentEmail = email;
    emailPreview.textContent = email;
    resetForm.classList.remove('is-hidden');
    setMessage(requestMessage, message, 'is-success');
    startCooldown(30);
  } catch (error) {
    setMessage(requestMessage, error.message, 'is-error');
    if (error.message && error.message.toLowerCase().includes('wait 30 seconds')) {
      startCooldown(30);
    }
  }
});

resetForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const otp = resetForm.otp.value.trim();
  const newPassword = resetForm.newPassword.value.trim();
  const confirmPassword = resetForm.confirmPassword.value.trim();

  if (!currentEmail) {
    setMessage(resetMessage, 'Please request an OTP first.', 'is-error');
    return;
  }

  if (!otp || !newPassword || !confirmPassword) {
    setMessage(resetMessage, 'Please fill in all fields.', 'is-error');
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage(resetMessage, 'Passwords do not match.', 'is-error');
    return;
  }

  try {
    const message = await resetPassword({
      email: currentEmail,
      otp,
      newPassword,
      confirmPassword
    });
    setMessage(resetMessage, message, 'is-success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  } catch (error) {
    setMessage(resetMessage, error.message, 'is-error');
  }
});

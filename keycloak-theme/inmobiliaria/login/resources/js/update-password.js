/**
 * Update password page JavaScript functionality
 * Handles password validation, requirements checking, and form submission
 */

const I18N = {
  toastCloseLabel: '${msg("toastCloseLabel")?js_string}',
  passwordRequired: '${msg("validationPasswordRequired")?js_string}',
  passwordMinLength: '${msg("validationPasswordMinLength")?js_string}',
  passwordUppercase: '${msg("validationPasswordUppercase")?js_string}',
  passwordLowercase: '${msg("validationPasswordLowercase")?js_string}',
  passwordNumber: '${msg("validationPasswordNumber")?js_string}',
  passwordConfirmRequired: '${msg("validationPasswordConfirmRequired")?js_string}',
  passwordsDoNotMatch: '${msg("validationPasswordsDoNotMatch")?js_string}',
  serverErrors: {
    invalidUsernameOrPasswordMessage: '${msg("invalidUsernameOrPasswordMessage")?js_string}',
    invalidUserMessage: '${msg("invalidUserMessage")?js_string}',
    accountDisabledMessage: '${msg("accountDisabledMessage")?js_string}',
    accountTemporarilyDisabledMessage: '${msg("accountTemporarilyDisabledMessage")?js_string}',
    expiredCodeMessage: '${msg("expiredCodeMessage")?js_string}',
    expiredActionMessage: '${msg("expiredActionMessage")?js_string}',
    missingUsernameMessage: '${msg("missingUsernameMessage")?js_string}',
    missingPasswordMessage: '${msg("missingPasswordMessage")?js_string}',
    usernameExistsMessage: '${msg("usernameExistsMessage")?js_string}',
    emailExistsMessage: '${msg("emailExistsMessage")?js_string}',
    invalidEmailMessage: '${msg("invalidEmailMessage")?js_string}',
    missingFirstNameMessage: '${msg("missingFirstNameMessage")?js_string}',
    missingLastNameMessage: '${msg("missingLastNameMessage")?js_string}',
    missingEmailMessage: '${msg("missingEmailMessage")?js_string}',
    notMatchPasswordMessage: '${msg("notMatchPasswordMessage")?js_string}',
    invalidPasswordMinLengthMessage: '${msg("invalidPasswordMinLengthMessage")?js_string}',
    invalidPasswordMaxLengthMessage: '${msg("invalidPasswordMaxLengthMessage")?js_string}',
    invalidPasswordMinDigitsMessage: '${msg("invalidPasswordMinDigitsMessage")?js_string}',
    invalidPasswordMinLowerCaseCharsMessage: '${msg("invalidPasswordMinLowerCaseCharsMessage")?js_string}',
    invalidPasswordMinUpperCaseCharsMessage: '${msg("invalidPasswordMinUpperCaseCharsMessage")?js_string}',
    invalidPasswordMinSpecialCharsMessage: '${msg("invalidPasswordMinSpecialCharsMessage")?js_string}',
    invalidPasswordNotUsernameMessage: '${msg("invalidPasswordNotUsernameMessage")?js_string}',
    invalidPasswordNotEmailMessage: '${msg("invalidPasswordNotEmailMessage")?js_string}',
    invalidPasswordHistoryMessage: '${msg("invalidPasswordHistoryMessage")?js_string}',
    invalidPasswordRegexPatternMessage: '${msg("invalidPasswordRegexPatternMessage")?js_string}'
  }
};

let toastTimer;

function setButtonLoading(button) {
  if (!button || button.classList.contains('is-loading')) return;
  button.classList.add('is-loading');
  button.setAttribute('aria-busy', 'true');
  button.disabled = true;
}

const SERVER_ERROR_MAP = I18N.serverErrors;

function ensureToastElements() {
  let toast = document.getElementById('toastMessage');
  if (!toast) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';

    toast = document.createElement('div');
    toast.id = 'toastMessage';
    toast.className = 'toast';
    toast.innerHTML = '<span class="material-icons toast-icon">error_outline</span>' +
      '<div class="toast-text"></div>' +
      '<button type="button" class="toast-close" aria-label="' + I18N.toastCloseLabel + '">x</button>';

    container.appendChild(toast);
    document.body.appendChild(container);

    toast.querySelector('.toast-close').addEventListener('click', hideToast);
  }
  return toast;
}

function showToast(message, options = {}) {
  const { type = 'error', duration = 6000 } = options;
  const toast = ensureToastElements();
  const container = toast.parentElement;
  const icon = toast.querySelector('.toast-icon');
  const text = toast.querySelector('.toast-text');

  toast.classList.remove('toast-error', 'toast-warning', 'toast-success', 'toast-info');
  toast.classList.add('toast-' + type);

  const iconMap = {
    error: 'error_outline',
    warning: 'warning',
    success: 'check_circle',
    info: 'info'
  };
  icon.innerText = iconMap[type] || iconMap.error;
  text.textContent = message;

  container.classList.add('visible');
  toast.classList.add('visible');

  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => hideToast(), duration);
}

function hideToast() {
  const toast = document.getElementById('toastMessage');
  if (toast) {
    toast.classList.remove('visible');
    const container = toast.parentElement;
    if (container) {
      container.classList.remove('visible');
    }
  }
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

function translateServerMessage(key, fallback) {
  if (!key) {
    return fallback || '';
  }
  if (SERVER_ERROR_MAP[key]) {
    return SERVER_ERROR_MAP[key];
  }
  const regex = /([a-zA-Z]+Message)/g;
  const matches = key.match(regex);
  if (matches && matches.length > 0) {
    const translatedParts = matches.map(match => SERVER_ERROR_MAP[match] || match);
    return translatedParts.join(' ');
  }
  return SERVER_ERROR_MAP[key] || fallback || key;
}

function togglePassword(btn) {
  const wrapper = btn.closest('.password-wrapper');
  const input = wrapper?.querySelector('input');
  if (!input || !btn) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.querySelector('.material-icons').innerText = 'visibility_off';
  } else {
    input.type = 'password';
    btn.querySelector('.material-icons').innerText = 'visibility';
  }
}

function meetsPasswordRules(value) {
  return (
    value.length >= 8 &&
    /[!@#$%^&*(),.?\":{}|<>]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value)
  );
}

function updatePasswordRequirements(value) {
  const rules = {
    length: value.length >= 8,
    special: /[!@#$%^&*(),.?\":{}|<>]/.test(value),
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
  };
  const container = document.getElementById('passwordRequirements');
  if (!container) return;
  Object.entries(rules).forEach(([key, ok]) => {
    const row = container.querySelector('[data-rule=\"' + key + '\"]');
    if (!row) return;
    const icon = row.querySelector('.req-icon');
    if (ok) {
      row.classList.add('ok');
      if (icon) icon.textContent = 'check_circle';
    } else {
      row.classList.remove('ok');
      if (icon) icon.textContent = 'radio_button_unchecked';
    }
  });
}

function validatePasswordForm() {
  const passwordNew = document.getElementById('password-new');
  const passwordConfirm = document.getElementById('password-confirm');
  const password = passwordNew.value;
  const confirmPassword = passwordConfirm.value;
  const matchHint = document.getElementById('passwordMatchHint');

  passwordNew.style.borderColor = '';
  passwordConfirm.style.borderColor = '';

  if (!password) {
    showToast(I18N.passwordRequired, { type: 'error' });
    passwordNew.style.borderColor = '#ff6b6b';
    passwordNew.focus();
    return false;
  }

  if (password.length < 8) {
    showToast(I18N.passwordMinLength, { type: 'error' });
    passwordNew.style.borderColor = '#ff6b6b';
    passwordNew.focus();
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    showToast(I18N.passwordUppercase, { type: 'error' });
    passwordNew.style.borderColor = '#ff6b6b';
    passwordNew.focus();
    return false;
  }

  if (!/[a-z]/.test(password)) {
    showToast(I18N.passwordLowercase, { type: 'error' });
    passwordNew.style.borderColor = '#ff6b6b';
    passwordNew.focus();
    return false;
  }

  if (!/\d/.test(password)) {
    showToast(I18N.passwordNumber, { type: 'error' });
    passwordNew.style.borderColor = '#ff6b6b';
    passwordNew.focus();
    return false;
  }

  if (!confirmPassword) {
    showToast(I18N.passwordConfirmRequired, { type: 'error' });
    passwordConfirm.style.borderColor = '#ff6b6b';
    passwordConfirm.focus();
    return false;
  }

  if (password !== confirmPassword) {
    showToast(I18N.passwordsDoNotMatch, { type: 'error' });
    passwordConfirm.style.borderColor = '#ff6b6b';
    passwordNew.style.borderColor = '#ff6b6b';
    if (matchHint) {
      matchHint.textContent = 'Las contraseñas no coinciden';
      matchHint.classList.remove('ok');
      matchHint.classList.add('error');
    }
    passwordConfirm.focus();
    return false;
  }
  if (matchHint) {
    matchHint.textContent = 'Las contraseñas coinciden';
    matchHint.classList.remove('error');
    matchHint.classList.add('ok');
  }

  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  ensureToastElements();

  const form = document.getElementById('updatePasswordForm');
  const submitButton = form.querySelector('.btn-primary');

  form.addEventListener('submit', (e) => {
    if (!validatePasswordForm()) {
      e.preventDefault();
      return false;
    }
    setButtonLoading(submitButton);
  });

  const serverMessageElement = document.getElementById('serverErrorMessage');
  if (serverMessageElement) {
    const serverKey = serverMessageElement.dataset.messageKey;
    const fallback = serverMessageElement.textContent.trim();
    const translated = translateServerMessage(serverKey, fallback);
    serverMessageElement.textContent = translated;

    const serverBanner = document.getElementById('serverErrorBanner');
    if (serverBanner) {
      setTimeout(() => {
        serverBanner.style.transition = 'opacity 0.5s';
        serverBanner.style.opacity = '0';
        setTimeout(() => serverBanner.remove(), 500);
      }, 8000);
    }
  }

  const inputs = form.querySelectorAll('input[type="password"]');
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      input.style.borderColor = '';
    });
  });

  const passwordNew = document.getElementById('password-new');
  const passwordConfirmInput = document.getElementById('password-confirm');
  const reqBox = document.getElementById('passwordRequirements');
  const preventSpace = (ev) => {
    if (ev.key === ' ') ev.preventDefault();
  };
  passwordNew.addEventListener('keydown', preventSpace);
  passwordConfirmInput.addEventListener('keydown', preventSpace);
  updatePasswordRequirements(passwordNew.value);
  passwordNew.addEventListener('input', (ev) => {
    const sanitized = ev.target.value.replace(/\s+/g, '');
    if (sanitized !== ev.target.value) ev.target.value = sanitized;
    updatePasswordRequirements(ev.target.value);
    const matchHint = document.getElementById('passwordMatchHint');
    if (matchHint && passwordConfirmInput.value) {
      if (!meetsPasswordRules(ev.target.value)) {
        matchHint.textContent = 'Las contraseñas no cumplen con las especificaciones';
        matchHint.classList.add('error');
        matchHint.classList.remove('ok');
      } else {
        const ok = ev.target.value === passwordConfirmInput.value;
        matchHint.textContent = ok ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden';
        matchHint.classList.toggle('ok', ok);
        matchHint.classList.toggle('error', !ok);
      }
    }
  });
  passwordNew.addEventListener('focus', () => {
    if (reqBox) reqBox.classList.add('active');
  });
  passwordNew.addEventListener('blur', () => {
    if (reqBox) reqBox.classList.remove('active');
  });
  passwordConfirmInput.addEventListener('input', (ev) => {
    const sanitized = ev.target.value.replace(/\s+/g, '');
    if (sanitized !== ev.target.value) ev.target.value = sanitized;
    const matchHint = document.getElementById('passwordMatchHint');
    if (matchHint) {
      if (ev.target.value && passwordNew.value) {
        if (!meetsPasswordRules(passwordNew.value)) {
          matchHint.textContent = 'Las contraseñas no cumplen con las especificaciones';
          matchHint.classList.add('error');
          matchHint.classList.remove('ok');
        } else {
          const ok = ev.target.value === passwordNew.value;
          matchHint.textContent = ok ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden';
          matchHint.classList.toggle('ok', ok);
          matchHint.classList.toggle('error', !ok);
        }
      } else {
        matchHint.textContent = '';
        matchHint.classList.remove('ok', 'error');
      }
    }
  });
});
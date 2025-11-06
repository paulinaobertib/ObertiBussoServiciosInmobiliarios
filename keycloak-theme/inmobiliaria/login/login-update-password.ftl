<#import "common.ftl" as common>
<@common.page title="Actualizar contraseña">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

  <div class="login-layout">
    <div class="login-container">
      <div class="login-form-box">
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="Oberti Busso" />
        </div>

        <h2 class="welcome-title">Creá tu nueva contraseña</h2>
        <p class="welcome-desc">
          Elegí una contraseña segura para terminar de configurar tu cuenta.
        </p>

        <form id="updatePasswordForm" action="${url.loginAction}" method="post" class="auth-form">
          <#if stateChecker??>
            <input type="hidden" name="stateChecker" value="${stateChecker}" />
          </#if>
          <div class="password-wrapper">
            <input
              type="password"
              id="password-new"
              name="password-new"
              placeholder="Nueva contraseña"
              autocomplete="new-password"
              autofocus
              required
            />
            <button type="button" class="toggle-password" data-target="password-new">
              <span class="material-icons">visibility</span>
            </button>
          </div>

          <div class="password-wrapper">
            <input
              type="password"
              id="password-confirm"
              name="password-confirm"
              placeholder="Confirmar contraseña"
              autocomplete="new-password"
              required
            />
            <button type="button" class="toggle-password" data-target="password-confirm">
              <span class="material-icons">visibility</span>
            </button>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" value="update-password">
              <span class="btn-label">Guardar contraseña e Iniciar Sesión</span>
            </button>
          </div>
        </form>

        <!-- Banner de errores del servidor -->
        <#if message?has_content && (message.type == 'error' || message.type == 'warning')>
          <div class="server-error-banner ${message.type}" id="serverErrorBanner">
            <span class="material-icons">error_outline</span>
            <div class="error-content">
              <#assign localizedMessage = msg(message.summary)!message.summary>
              <strong id="serverErrorMessage" data-message-key="${message.summary}">${kcSanitize(localizedMessage)?no_esc}</strong>
            </div>
          </div>
        </#if>
      </div>
    </div>
  </div>

  <script>
 
  <script>
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

    function togglePassword(button) {
      const targetId = button.getAttribute('data-target');
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        button.querySelector('.material-icons').innerText = 'visibility_off';
      } else {
        input.type = 'password';
        button.querySelector('.material-icons').innerText = 'visibility';
      }
    }

    function validatePasswordForm() {
      const passwordNew = document.getElementById('password-new');
      const passwordConfirm = document.getElementById('password-confirm');
      const password = passwordNew.value;
      const confirmPassword = passwordConfirm.value;

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
        passwordConfirm.focus();
        return false;
      }

      return true;
    }

    document.addEventListener('DOMContentLoaded', () => {
      ensureToastElements();

      const toggles = document.querySelectorAll('.toggle-password');
      toggles.forEach((button) => {
        button.addEventListener('click', () => togglePassword(button));
      });

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

      const passwordConfirmInput = document.getElementById('password-confirm');
      passwordConfirmInput.addEventListener('blur', () => {
        const passwordNew = document.getElementById('password-new');
        if (passwordConfirmInput.value && passwordNew.value !== passwordConfirmInput.value) {
          passwordConfirmInput.style.borderColor = '#ff6b6b';
        } else if (passwordConfirmInput.value) {
          passwordConfirmInput.style.borderColor = '#4caf50';
        }
      });
    });
  </script>
</@common.page>

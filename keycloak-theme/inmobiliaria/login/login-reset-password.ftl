<#import "common.ftl" as common>
<@common.page title="${msg('resetPasswordTitle')}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

  <div class="login-layout">
    <div class="login-container">
      <div class="login-form-box">
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="${msg('logoAltText')}" />
        </div>

        <h2 class="welcome-title">${msg('emailForgotTitle')}</h2>
        <p class="welcome-desc">
          ${msg('resetPasswordSubtitle')}
        </p>

        <form id="resetPasswordForm" action="${url.loginAction}" method="post" class="auth-form">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="${msg('usernameOrEmail')}"
            autofocus
            required
          />

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <span class="btn-label">${msg('resetPasswordSubmit')}</span>
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

        <div class="url-footer">
          <span>${msg('rememberPasswordQuestion')} <a href="${url.loginUrl}">${msg('backToLogin')}</a></span>
        </div>
      </div>
    </div>
  </div>

  <script>
    const I18N = {
      toastCloseLabel: '${msg("toastCloseLabel")?js_string}',
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
      },
      validation: {
        usernameOrEmailRequired: '${msg("validationUsernameOrEmailRequired")?js_string}',
        emailFormatInvalid: '${msg("validationEmailFormatDetailed")?js_string}',
        usernameMinLength: '${msg("validationUsernameMinLength")?js_string}'
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

    function validateResetForm() {
      const usernameInput = document.getElementById('username');
      const username = usernameInput.value.trim();

      usernameInput.style.borderColor = '';

      if (!username) {
        showToast(I18N.validation.usernameOrEmailRequired, { type: 'error' });
        usernameInput.style.borderColor = '#ff6b6b';
        usernameInput.focus();
        return false;
      }

      if (username.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
          showToast(I18N.validation.emailFormatInvalid, { type: 'error' });
          usernameInput.style.borderColor = '#ff6b6b';
          usernameInput.focus();
          return false;
        }
      } else {
        if (username.length < 3) {
          showToast(I18N.validation.usernameMinLength, { type: 'error' });
          usernameInput.style.borderColor = '#ff6b6b';
          usernameInput.focus();
          return false;
        }
      }

      return true;
    }

    document.addEventListener('DOMContentLoaded', () => {
      ensureToastElements();

      const form = document.getElementById('resetPasswordForm');
      const submitButton = form.querySelector('.btn-primary');
      
      form.addEventListener('submit', (e) => {
        if (!validateResetForm()) {
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

      const usernameInput = document.getElementById('username');
      usernameInput.addEventListener('input', () => {
        usernameInput.style.borderColor = '';
      });
    });
  </script>
</@common.page>

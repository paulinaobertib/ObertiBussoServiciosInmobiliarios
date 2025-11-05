<#import "common.ftl" as common>
<@common.page title="Iniciar sesión">

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="login-layout">

    <!-- Contenedor único: logo arriba, form en medio, frases abajo -->
    <div class="login-container">

      <div class="login-form-box">

        <!-- Logo -->
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="Oberti Busso">
        </div>

        <h2 id="formTitle" class="welcome-title">Bienvenido</h2>

        <!-- Login -->
        <#assign googleLoginUrl="">
        <#if social?? && social.providers?has_content>
          <#list social.providers as provider>
            <#if provider.alias == "google">
              <#assign googleLoginUrl=provider.loginUrl>
            </#if>
          </#list>
        </#if>
        <form id="loginForm" action="${url.loginAction}" method="post" class="auth-form" autocomplete="on">
          <input type="text" name="username" placeholder="Usuario o email" required />
      
          <div class="password-wrapper">
              <input type="password" name="password" placeholder="Contraseña" required />
              <button type="button" class="toggle-password" onclick="togglePassword(this)">
                  <span class="material-icons">visibility</span>
              </button>
          </div>
      
          <div class="forgot-password">
              <a href="${url.loginResetCredentialsUrl}">¿Olvidaste tu contraseña?</a>
          </div>
      
          <div class="form-actions">
              <button type="submit" class="btn-primary">
                <span class="btn-label">Iniciar sesión</span>
              </button>
              <div class="or-text">ó</div>
                            <button type="button" class="google-btn"<#if googleLoginUrl?has_content> data-login-url="${googleLoginUrl}"</#if>>
                  <img src="${url.resourcesPath}/google.png" alt="Google logo"/>
                  <span class="btn-label">Iniciar sesión con Google</span>
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

        <!-- Footer toggle -->
        <div class="url-footer">
          <span id="urlFooter">
            ¿No tenés cuenta? <a href="${url.registrationUrl}">Registrate</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <script>
    let toastTimer;

    function setButtonLoading(button) {
      if (!button || button.classList.contains('is-loading')) return;
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      button.disabled = true;
    }

    function clearButtonLoading(button) {
      if (!button) return;
      const label = button.querySelector('.btn-label');
      if (label && label.dataset.originalText) {
        label.textContent = label.dataset.originalText;
      }
      button.classList.remove('is-loading');
      button.removeAttribute('aria-busy');
      button.disabled = false;
    }

    const SERVER_ERROR_MAP = {
      invalidUsernameOrPasswordMessage: 'Usuario o contraseña incorrectos.',
      invalidUserMessage: 'Usuario inválido. Por favor verifica los datos ingresados.',
      accountDisabledMessage: 'Tu cuenta está deshabilitada. Contacta al administrador.',
      accountTemporarilyDisabledMessage: 'Tu cuenta está temporalmente bloqueada. Intenta más tarde.',
      expiredCodeMessage: 'El código ha expirado. Por favor solicita uno nuevo.',
      expiredActionMessage: 'La acción ha expirado. Por favor inicia el proceso nuevamente.',
      missingUsernameMessage: 'Debes ingresar tu usuario o email.',
      missingPasswordMessage: 'Debes ingresar tu contraseña.',
      usernameExistsMessage: 'El nombre de usuario ya está en uso. Elige uno diferente.',
      emailExistsMessage: 'El email ya está registrado. Inicia sesión o recupera tu contraseña.',
      invalidEmailMessage: 'El formato del email no es válido.',
      missingFirstNameMessage: 'Debes ingresar tu nombre.',
      missingLastNameMessage: 'Debes ingresar tu apellido.',
      missingEmailMessage: 'Debes ingresar tu email.',
      notMatchPasswordMessage: 'Las contraseñas no coinciden.',
      invalidPasswordMinLengthMessage: 'La contraseña es demasiado corta.',
      invalidPasswordMaxLengthMessage: 'La contraseña es demasiado larga.',
      invalidPasswordMinDigitsMessage: 'La contraseña debe contener más números.',
      invalidPasswordMinLowerCaseCharsMessage: 'La contraseña necesita más letras minúsculas.',
      invalidPasswordMinUpperCaseCharsMessage: 'La contraseña necesita más letras mayúsculas.',
      invalidPasswordMinSpecialCharsMessage: 'Agrega caracteres especiales a tu contraseña.',
      invalidPasswordNotUsernameMessage: 'La contraseña no puede ser igual al nombre de usuario.',
      invalidPasswordNotEmailMessage: 'La contraseña no puede ser igual al email.',
      invalidPasswordHistoryMessage: 'No puedes reutilizar una contraseña anterior.',
      invalidPasswordRegexPatternMessage: 'La contraseña no cumple con el patrón requerido.'
    };

    function ensureToastElements() {
      let toast = document.getElementById('toastMessage');
      if (!toast) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';

        toast = document.createElement('div');
        toast.id = 'toastMessage';
        toast.className = 'toast';
        toast.innerHTML = '<span class="material-icons toast-icon">error_outline</span><div class="toast-text"></div><button type="button" class="toast-close" aria-label="Cerrar aviso">x</button>';

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
      // Manejar concatenaciones de claves (ej: emailExistsMessageusernameExistsMessage)
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
      const input = wrapper.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.querySelector('.material-icons').innerText = 'visibility_off';
      } else {
        input.type = 'password';
        btn.querySelector('.material-icons').innerText = 'visibility';
      }
    }

    function validateLoginForm() {
      const usernameInput = document.querySelector('input[name="username"]');
      const passwordInput = document.querySelector('input[name="password"]');
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      usernameInput.style.borderColor = '';
      passwordInput.style.borderColor = '';

      if (!username) {
        showToast('Por favor ingresa tu usuario o email.', { type: 'error' });
        usernameInput.style.borderColor = '#ff6b6b';
        usernameInput.focus();
        return false;
      }

      if (username.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
          showToast('El formato del email es incorrecto. Debe ser algo como usuario@dominio.com.', { type: 'error' });
          usernameInput.style.borderColor = '#ff6b6b';
          usernameInput.focus();
          return false;
        }
      } else {
        if (username.length < 3) {
          showToast('El nombre de usuario debe tener al menos 3 caracteres.', { type: 'error' });
          usernameInput.style.borderColor = '#ff6b6b';
          usernameInput.focus();
          return false;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          showToast('El nombre de usuario solo puede contener letras, números, guiones (-) y guiones bajos (_).', { type: 'error' });
          usernameInput.style.borderColor = '#ff6b6b';
          usernameInput.focus();
          return false;
        }
      }

      if (!password) {
        showToast('Por favor ingresa tu contraseña.', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }


      return true;
    }

    document.addEventListener('DOMContentLoaded', () => {
      ensureToastElements();

      const form = document.getElementById('loginForm');
      const loginButton = form.querySelector('.btn-primary');
      const googleButton = document.querySelector('.google-btn');

      form.addEventListener('submit', (e) => {
        if (!validateLoginForm()) {
          e.preventDefault();
          return false;
        }
        setButtonLoading(loginButton);
        return true;
      });

      if (googleButton) {
        const loginUrl = googleButton.dataset.loginUrl;
        if (!loginUrl) {
          googleButton.disabled = true;
          googleButton.setAttribute('aria-disabled', 'true');
          googleButton.style.display = 'none';
        } else {
          googleButton.addEventListener('click', () => {
            setButtonLoading(googleButton);
            window.location.assign(loginUrl);
          });
        }
      }

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

      const inputs = form.querySelectorAll('input');
      inputs.forEach((input) => {
        input.addEventListener('input', () => {
          input.style.borderColor = '';
        });
        input.addEventListener('focus', () => {
          if (input.style.borderColor) {
            input.style.borderColor = '';
          }
        });
      });
    });
  </script>

</@common.page>

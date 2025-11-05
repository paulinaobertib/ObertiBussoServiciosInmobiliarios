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
    let toastTimer;

    function setButtonLoading(button) {
      if (!button || button.classList.contains('is-loading')) return;
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      button.disabled = true;
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
        showToast('Por favor ingresa una contraseña.', { type: 'error' });
        passwordNew.style.borderColor = '#ff6b6b';
        passwordNew.focus();
        return false;
      }

      if (password.length < 8) {
        showToast('La contraseña debe tener al menos 8 caracteres.', { type: 'error' });
        passwordNew.style.borderColor = '#ff6b6b';
        passwordNew.focus();
        return false;
      }

      if (!/[A-Z]/.test(password)) {
        showToast('La contraseña debe incluir al menos una letra MAYÚSCULA (A-Z).', { type: 'error' });
        passwordNew.style.borderColor = '#ff6b6b';
        passwordNew.focus();
        return false;
      }

      if (!/[a-z]/.test(password)) {
        showToast('La contraseña debe incluir al menos una letra minúscula (a-z).', { type: 'error' });
        passwordNew.style.borderColor = '#ff6b6b';
        passwordNew.focus();
        return false;
      }

      if (!/\d/.test(password)) {
        showToast('La contraseña debe incluir al menos un número (0-9).', { type: 'error' });
        passwordNew.style.borderColor = '#ff6b6b';
        passwordNew.focus();
        return false;
      }

      if (!confirmPassword) {
        showToast('Por favor confirma tu contraseña.', { type: 'error' });
        passwordConfirm.style.borderColor = '#ff6b6b';
        passwordConfirm.focus();
        return false;
      }

      if (password !== confirmPassword) {
        showToast('Las contraseñas no coinciden. Por favor verifícalas e intenta nuevamente.', { type: 'error' });
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
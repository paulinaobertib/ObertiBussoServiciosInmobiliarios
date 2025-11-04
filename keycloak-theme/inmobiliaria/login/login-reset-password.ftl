<#import "common.ftl" as common>
<@common.page title="Restablecer contraseña">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

  <div class="login-layout">
    <div class="login-container">
      <div class="login-form-box">
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="Oberti Busso" />
        </div>

        <h2 class="welcome-title">¿Olvidaste tu contraseña?</h2>
        <p class="welcome-desc">
          Ingresá tu usuario o email y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        <#if message?has_content>
          <#assign localizedMessage = msg(message.summary)!message.summary>
          <div class="form-message ${message.type!"info"}" data-message-key="${message.summary}" data-message-text="${kcSanitize(localizedMessage)?no_esc}">
            ${kcSanitize(localizedMessage)?no_esc}
          </div>
        </#if>

        <#assign attemptedUsername = (auth.attemptedUsername!'')>
        <form id="resetPasswordForm" action="${url.loginAction}" method="post" class="auth-form">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Usuario o email"
            autofocus
            required
            value="${attemptedUsername?html}"
          />

          <div class="form-actions">
            <button type="submit" class="btn-primary">Enviar enlace de recuperación</button>
          </div>
        </form>

        <div class="url-footer">
          <span>¿Recordaste tu contraseña? <a href="${url.loginUrl}">Volver al inicio de sesión</a></span>
        </div>
      </div>

      <div class="phrase-box">
        <p id="phrase-text">Buscá tu próximo hogar aquí</p>
      </div>
    </div>
  </div>

  <script>
    let toastTimer;

    const SERVER_MESSAGE_MAP = {
      emailSentMessage: 'Si el usuario existe, te enviaremos un correo con instrucciones.',
      emailSendErrorMessage: 'No pudimos enviar el correo. Verifica la configuración de email con el administrador.',
      emailSendSuccess: 'Correo enviado correctamente.',
      accountTemporarilyDisabledMessage: 'Tu cuenta está temporalmente bloqueada. Intenta más tarde.',
      invalidUserMessage: 'No encontramos un usuario con esos datos.',
      invalidUsernameMessage: 'Usuario inválido. Revisá lo ingresado.',
      missingUsernameMessage: 'Debes ingresar tu usuario o email.'
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
      if (SERVER_MESSAGE_MAP[key]) {
        return SERVER_MESSAGE_MAP[key];
      }
      return fallback || key;
    }

    function setButtonLoading(button) {
      if (!button || button.classList.contains('is-loading')) return;
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      button.disabled = true;
    }

    document.addEventListener('DOMContentLoaded', () => {
      const phrases = [
        "Administración de tus propiedades",
        "Servicio inmobiliario a tu alcance",
        "Buscá tu próximo hogar aquí",
        "Guardá como favorito para visualizarlos luego",
        "Seguimiento personalizado",
      ];
      let idx = 0;
      const el = document.getElementById('phrase-text');
      setInterval(() => {
        if (el) {
          el.innerText = phrases[idx];
        }
        idx = (idx + 1) % phrases.length;
      }, 4000);

      const form = document.getElementById('resetPasswordForm');
      const submitButton = form.querySelector('.btn-primary');
      
      form.addEventListener('submit', (e) => {
        const usernameInput = document.getElementById('username');
        if (!usernameInput.value.trim()) {
          e.preventDefault();
          showToast('Por favor ingresá tu usuario o email.', { type: 'error' });
          return false;
        }
        setButtonLoading(submitButton);
      });

      const serverMessageElement = document.querySelector('.form-message');
      if (serverMessageElement) {
        const type = serverMessageElement.classList.contains('error')
          ? 'error'
          : serverMessageElement.classList.contains('warning')
          ? 'warning'
          : serverMessageElement.classList.contains('success')
          ? 'success'
          : 'info';
        const messageKey = serverMessageElement.dataset.messageKey;
        const messageText = serverMessageElement.dataset.messageText || serverMessageElement.textContent.trim();
        const translated = translateServerMessage(messageKey, messageText);
        serverMessageElement.textContent = translated;
        showToast(translated, { type });
      }
    });
  </script>
</@common.page>

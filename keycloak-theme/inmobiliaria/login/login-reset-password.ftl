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
          <div class="form-message ${message.type!"info"}">
            ${message.summary?no_esc}
          </div>
        </#if>

        <form id="resetPasswordForm" action="${url.loginAction}" method="post" class="auth-form">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Usuario o email"
            autofocus
            required
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
          return false;
        }
        setButtonLoading(submitButton);
      });
    });
  </script>
</@common.page>

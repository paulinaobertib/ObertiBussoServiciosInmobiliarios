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
            <button type="submit" class="btn-primary" value="update-password">Guardar contraseña</button>
          </div>
        </form>
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

    document.addEventListener('DOMContentLoaded', () => {
      const toggles = document.querySelectorAll('.toggle-password');
      toggles.forEach((button) => {
        button.addEventListener('click', () => togglePassword(button));
      });

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

      const form = document.getElementById('updatePasswordForm');
      const submitButton = form.querySelector('.btn-primary');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const passwordNew = document.getElementById('password-new');
        const passwordConfirm = document.getElementById('password-confirm');

        if (!passwordNew.value || !passwordConfirm.value) {
          return false;
        }

        if (passwordNew.value !== passwordConfirm.value) {
          return false;
        }

        setButtonLoading(submitButton);

        // Create a hidden iframe to submit the form
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = 'password-update-frame';
        document.body.appendChild(iframe);

        // Set form target to iframe
        form.target = 'password-update-frame';
        
        // Submit the form to the iframe (this will update the password in Keycloak)
        form.submit();

        // Wait a moment for the form to be processed, then redirect to login
        setTimeout(() => {
          // Store success flag
          sessionStorage.setItem('passwordUpdated', 'true');
          // Redirect to login page (this prevents auto-login)
          window.location.href = '${url.loginUrl?js_string}';
        }, 1000);
      });
    });
  </script>
</@common.page>

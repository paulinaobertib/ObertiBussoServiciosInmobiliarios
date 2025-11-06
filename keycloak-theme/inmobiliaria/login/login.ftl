<#import "common.ftl" as common>
<@common.page title="${msg('loginTitle')}">

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="login-layout">

    <!-- Contenedor único: logo arriba, form en medio, frases abajo -->
    <div class="login-container">

      <div class="login-form-box">

        <!-- Logo -->
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="${msg('logoAltText')}">
        </div>

        <h2 id="formTitle" class="welcome-title">${msg('loginTitle')}</h2>

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
          <input type="text" name="username" placeholder="${msg('usernameOrEmail')}" required />
      
          <div class="password-wrapper">
              <input type="password" name="password" placeholder="${msg('password')}" required />
              <button type="button" class="toggle-password" onclick="togglePassword(this)">
                  <span class="material-icons">visibility</span>
              </button>
          </div>
      
          <div class="forgot-password">
              <a href="${url.loginResetCredentialsUrl}">${msg('doForgotPassword')}</a>
          </div>
      
          <div class="form-actions">
              <button type="submit" class="btn-primary">
                <span class="btn-label">${msg('doLogIn')}</span>
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
            ${msg('noAccount')} <a href="${url.registrationUrl}">${msg('doRegister')}</a>
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

    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('loginForm');
      const loginButton = form.querySelector('.btn-primary');
      const googleButton = document.querySelector('.google-btn');

      form.addEventListener('submit', (e) => {
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
          let googleLoadingTimeout;
          googleButton.addEventListener('click', () => {
            setButtonLoading(googleButton);
            
            // Timeout de 10 segundos para el loading de Google
            googleLoadingTimeout = setTimeout(() => {
              clearButtonLoading(googleButton);
            }, 10000);
            
            window.location.assign(loginUrl);
          });
          
          // Limpiar el timeout si el usuario vuelve a la página
          window.addEventListener('pageshow', () => {
            if (googleLoadingTimeout) {
              clearTimeout(googleLoadingTimeout);
            }
            clearButtonLoading(googleButton);
          });
        }
      }

      const serverBanner = document.getElementById('serverErrorBanner');
      if (serverBanner) {
        setTimeout(() => {
          serverBanner.style.transition = 'opacity 0.5s';
          serverBanner.style.opacity = '0';
          setTimeout(() => serverBanner.remove(), 500);
        }, 8000);
      }
    });
  </script>

</@common.page>

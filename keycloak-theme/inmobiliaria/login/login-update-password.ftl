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
          <div class="password-field">
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
              <button type="button" class="toggle-password" onclick="togglePassword(this)">
                <span class="material-icons">visibility</span>
              </button>
            </div>
            <div class="password-requirements" id="passwordRequirements">
              <div class="req-item" data-rule="length">
                <span class="material-icons req-icon">radio_button_unchecked</span>
                <span>Mínimo 8 caracteres</span>
              </div>
              <div class="req-item" data-rule="special">
                <span class="material-icons req-icon">radio_button_unchecked</span>
                <span>Mínimo un caracter especial</span>
              </div>
              <div class="req-item" data-rule="uppercase">
                <span class="material-icons req-icon">radio_button_unchecked</span>
                <span>Mínimo una mayúscula</span>
              </div>
              <div class="req-item" data-rule="number">
                <span class="material-icons req-icon">radio_button_unchecked</span>
                <span>Mínimo un número</span>
              </div>
            </div>
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
            <button type="button" class="toggle-password" onclick="togglePassword(this)">
              <span class="material-icons">visibility</span>
            </button>
          </div>
          <div id="passwordMatchHint" class="password-match-hint" aria-live="polite"></div>

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

  <script src="${url.resourcesPath}/js/update-password.js"></script>
</@common.page>

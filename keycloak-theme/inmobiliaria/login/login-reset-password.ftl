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
            <button type="submit" class="btn-primary">
              <span class="btn-label">Enviar enlace de recuperación</span>
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
          <span>¿Recordaste tu contraseña? <a href="${url.loginUrl}">Volver al inicio de sesión</a></span>
        </div>
      </div>
    </div>
  </div>

  <script src="${url.resourcesPath}/js/reset-password.js"></script>
</@common.page>

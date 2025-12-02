<#import "common.ftl" as common>
<@common.page title="Registrarse">

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="${url.resourcesPath}/styles.css">

  <div class="login-layout">

    <!-- Contenedor único: logo arriba, form en medio, frases abajo -->
    <div class="login-container">
      <div class="login-form-box">

        <!-- Logo -->
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="Oberti Busso">
        </div>

        <h2 id="formTitle" class="welcome-title">Creá tu Cuenta</h2>

        <!-- Registro -->
        <form
          id="registerForm"
          action="${url.registrationAction}"
          method="post"
          class="auth-form"
          autocomplete="on"
        >

          <div class="input-row">
            <div>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value="${(user.firstName!'')}"
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value="${(user.lastName!'')}"
                placeholder="Apellido"
                required
              />
            </div>
          </div>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Correo electrónico"
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            value="${(user.email!'')}"
            title="Debe ser un email válido (incluye @ y dominio)"
            required
          />

          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Teléfono"
            pattern="\d{10,15}"
            title="10 dígitos numéricos"
            required
          />

          <input
            type="hidden"
            id="username"
            name="username"
            placeholder="Usuario"
            value="${(user.username!'')}"
            readonly
            title="El nombre de usuario debe tener 3 dígitos como mínimo"
            minlength="3"
            required
          />

          <div class="terms-section">
            <div class="terms-checkbox">
              <input type="checkbox" id="acceptTerms" name="terms_and_conditions" required />
              <label for="acceptTerms">
                <span>
                  Aceptar los 
                  <a href="https://www.inmobiliariaobertibusso.com.ar/policies" target="_blank" class="terms-link">
                    Términos y Condiciones
                  </a>
                </span>
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <span class="btn-label">Registrarse</span>
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
            ¿Ya tenés cuenta? <a href="${url.loginUrl}">Iniciar sesión</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <script src="${url.resourcesPath}/js/review-profile.js"></script>
</@common.page>

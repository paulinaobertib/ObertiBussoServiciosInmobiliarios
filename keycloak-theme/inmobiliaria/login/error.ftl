<#import "common.ftl" as common>
<@common.page title="Error de inicio de sesión">

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <div class="login-layout">
    <div class="login-container">

      <div class="login-form-box">
        <!-- Logo -->
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="Oberti Busso">
        </div>

        <!-- Título de error -->
        <div class="error-title">No se ha podido iniciar sesión</div>

        <!-- Mensaje de error -->
        <div class="error-message">
          Ocurrió un problema al intentar iniciar sesión.<br>
          Por favor, intentá nuevamente más tarde.<br>
          Si el problema persiste, contactá a soporte.
        </div>

        <!-- Acciones -->
        <div class="form-actions">
          <a class="btn-primary" href="${url.loginUrl!'/'}" style="text-decoration:none;">Volver a iniciar sesión</a>
        </div>
      </div>
  </div>

</@common.page>

<#import "common.ftl" as common>
<@common.page title="${message.summary!msg('successTitle')}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

  <#assign nextStepUrl="">
  <#assign redirectingToLogin=false>
  <#if url.loginUrl?? && url.loginUrl?has_content>
    <#assign nextStepUrl = url.loginUrl>
    <#assign redirectingToLogin = true>
  <#elseif url.redirectUri??>
    <#assign nextStepUrl = url.redirectUri>
  </#if>

  <#if nextStepUrl?has_content>
    <meta http-equiv="refresh" content="3;url=${nextStepUrl}" />
  </#if>

  <div class="login-layout">
    <div class="login-container">
      <div class="login-form-box">
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="Oberti Busso" />
        </div>

        <h2 class="welcome-title">${message.summary}</h2>

        <#if message.detail??>
          <p class="welcome-desc">${message.detail}</p>
        </#if>

        <#if nextStepUrl?has_content>
          <div class="form-actions">
            <a class="btn-primary" href="${nextStepUrl}">
              <#if redirectingToLogin>
                ${msg('backToLogin')!msg('doLogIn')}
              <#else>
                ${msg('backToApplication')}
              </#if>
            </a>
          </div>
          <p class="help-text">
            <#if redirectingToLogin>
              Te estamos redirigiendo al inicio de sesión.
            <#else>
              Te estamos redirigiendo automáticamente.
            </#if>
          </p>
        <#else>
          <p class="help-text">Podés cerrar esta ventana.</p>
        </#if>
      </div>
    </div>
  </div>

  <#if nextStepUrl?has_content>
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          window.location.href = '${nextStepUrl?js_string}';
        }, 1500);
      });
    </script>
  </#if>
</@common.page>

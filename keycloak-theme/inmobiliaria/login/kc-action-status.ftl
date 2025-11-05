<#import "common.ftl" as common>
<@common.page title="${message.summary!msg('successTitle')}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

  <#if url.loginUrl??>
    <meta http-equiv="refresh" content="3;url=${url.loginUrl}" />
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

        <#if url.loginUrl??>
          <div class="form-actions">
            <a class="btn-primary" href="${url.loginUrl}">
              ${msg('backToApplication')}
            </a>
          </div>
          <p class="help-text">Te estamos redirigiendo automáticamente.</p>
        <#else>
          <p class="help-text">Podés cerrar esta ventana.</p>
        </#if>
      </div>
    </div>
  </div>

  <#if url.loginUrl??>
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          window.location.href = '${url.loginUrl?js_string}';
        }, 1500);
      });
    </script>
  </#if>
</@common.page>

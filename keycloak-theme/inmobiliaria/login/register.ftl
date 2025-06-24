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
        <form id="registerForm" action="${url.registrationAction}" method="post" class="auth-form" autocomplete="on">

          <div class="input-row">
            <div><input type="text" id="firstName" name="firstName" placeholder="Nombre" required/></div>
            <div><input type="text" id="lastName" name="lastName" placeholder="Apellido" required/></div>
          </div>

          <input type="email" id="email" name="email" placeholder="Correo electrónico" required/>
          <input type="tel" id="phone" name="phone" placeholder="Teléfono" required/>
          <input type="text" id="username" name="username" placeholder="Usuario" required/>

          <div class="password-wrapper">
            <input type="password" id="password" name="password" placeholder="Contraseña" required/>
            <button type="button" class="toggle-password" onclick="togglePassword(this)">
              <span class="material-icons">visibility</span>
            </button>
          </div>

          <div class="password-wrapper">
            <input type="password" id="password-confirm" name="password-confirm" placeholder="Confirmar contraseña" required/>
            <button type="button" class="toggle-password" onclick="togglePassword(this)">
              <span class="material-icons">visibility</span>
            </button>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">Registrarse</button>
          </div>
        </form>

        <!-- Footer toggle -->
        <div class="url-footer">
          <span id="urlFooter">
            ¿Ya tenés cuenta? <a href="${url.loginUrl}">Iniciar sesión</a>
          </span>
        </div>
      </div>

              <!-- Aquí mostramos el error de Keycloak -->
        <#if message??>
          <div class="error-message">
            <strong>${message.summary}</strong>
            <#if message.detail??>
              <div>${message.detail}</div>
            </#if>
          </div>
        </#if>

      <!-- Frases rotativas -->
       <div class="phrase-box">
        <p id="phrase-text">Buscá tu próximo hogar aquí</p>
       </div>
    </div>
  </div>

  <script>
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
      const phrases = [
        "Administración de tus propiedades",
        "Servicio inmobiliario a tu alcance",
        "Buscá tu próximo hogar aquí",
        "Guardá como favorito para visualizarlos luego",
        "Seguimiento personalizado",
      ];
      let idx = 0, el = document.getElementById('phrase-text');
      setInterval(() => {
        el.innerText = phrases[idx];
        idx = (idx + 1) % phrases.length;
      }, 4000);
    });
  </script>

</@common.page>

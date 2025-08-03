<#import "common.ftl" as common>
<@common.page title="Iniciar sesión">

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

        <h2 id="formTitle" class="welcome-title">Bienvenido</h2>

        <!-- Login -->
        <form id="loginForm" action="${url.loginAction}" method="post" class="auth-form" autocomplete="on">
          <input type="text" name="username" placeholder="Usuario o email" required />
      
          <div class="password-wrapper">
              <input type="password" name="password" placeholder="Contraseña" required />
              <button type="button" class="toggle-password" onclick="togglePassword(this)">
                  <span class="material-icons">visibility</span>
              </button>
          </div>
      
          <div class="forgot-password">
              <a href="${url.forgotPasswordAction!'#'}">¿Olvidaste tu contraseña?</a>
          </div>
      
          <div class="form-actions">
              <button type="submit" class="btn-primary">Iniciar sesión</button>
              <div class="or-text">ó</div>
              <button type="button" class="google-btn">
                  <img src="${url.resourcesPath}/google.png" alt="Google logo"/>
                  Iniciar sesión con Google
              </button>
          </div>
        </form>

        <!-- Footer toggle -->
        <div class="url-footer">
          <span id="urlFooter">
            ¿No tenés cuenta? <a href="${url.registrationUrl}">Registrate</a>
          </span>
        </div>
      </div>

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

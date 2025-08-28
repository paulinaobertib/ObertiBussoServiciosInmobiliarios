<#import "common.ftl" as common>
<@common.page title="Registrarse">

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="${url.resourcesPath}/styles.css">

  <div class="login-layout">

    <!-- Banner para errores -->
    <div
      id="errorBanner"
      class="kc-error-banner"
      style="
        display: none;
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        max-width: 90%;
        text-align: center;
      "
    ></div>

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
                placeholder="Nombre"
                value=tomi
                required
              />
            </div>
            <div>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Apellido"
                                value=tomi

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
            title="Debe ser un email válido (incluye @ y dominio)"
                            value=tomi@gmail.com

            required
          />

          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Teléfono"
            pattern="\d{10}"
            title="10 dígitos numéricos"
                            value=3510000000
            required
          />

          <input
            type="text"
            id="username"
            name="username"
            placeholder="Usuario"
            title="El nombre de usuario debe tener 3 dígitos como mínimo"
            minlength="3"
            value=tomi
            required
          />

          <div class="password-wrapper">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Contraseña"
              minlength="8"
              title="Mínimo 8 caracteres"
              value=T0000000
              required
            />
            <button type="button" class="toggle-password" onclick="togglePassword(this)">
              <span class="material-icons">visibility</span>
            </button>
          </div>

          <div class="password-wrapper">
            <input
              type="password"
              id="password-confirm"
              name="password-confirm"
              placeholder="Confirmar contraseña"
              value=T0000000
              required
            />
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
      // Frases rotativas
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
        el.innerText = phrases[idx];
        idx = (idx + 1) % phrases.length;
      }, 4000);

      // Validación y envío de formulario sin refrescar
      const form = document.getElementById('registerForm');
      const banner = document.getElementById('errorBanner');
    });
  </script>

</@common.page>

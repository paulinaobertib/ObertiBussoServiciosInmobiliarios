<#import "common.ftl" as common>
<@common.page title="Registrarse">
    <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    </head>

    <div class="nav-buttons">
        <a href="http://localhost:5173/" class="icon-button" title="Inicio">
            <span class="material-icons">home</span>
        </a>
        <button class="icon-button" onclick="history.back()" title="Volver">
            <span class="material-icons">reply</span>
        </button>
    </div>

    <div class="login-container">
        <div class="login-box register-box">
            <img src="${url.resourcesPath}/logo.png" alt="Logo" class="login-logo" />
            <h2>Crear una cuenta</h2>
            <form id="registerForm" action="${url.registrationAction}" method="post">
                <input type="text" name="firstName" placeholder="Nombre" required />
                <input type="text" name="lastName" placeholder="Apellido" required />
                <input type="text" name="username" placeholder="Nombre de usuario" required />
                <input type="email" name="email" placeholder="Correo Electrónico" required />
                <input type="tel" name="phone" placeholder="Teléfono" required />

                <div class="password-wrapper">
                    <input type="password" name="password" id="password" placeholder="Contraseña" required />
                    <button type="button" class="toggle-password" onclick="togglePassword('password', 'eye-icon')">
                        <span id="eye-icon" class="material-icons">visibility</span>
                    </button>
                </div>

                <div class="password-wrapper">
                    <input type="password" name="password-confirm" id="password-confirm" placeholder="Confirmar contraseña" required />
                    <button type="button" class="toggle-password" onclick="togglePassword('password-confirm', 'eye-icon-confirm')">
                        <span id="eye-icon-confirm" class="material-icons">visibility</span>
                    </button>
                </div>

                <input type="submit" value="Registrarse" />
            </form>

            <p class="register">
                ¿Ya tienes cuenta? <a href="${url.loginUrl}">Iniciar sesión</a>
            </p>
        </div>
    </div>

  <script>
      function togglePassword(inputId, iconId) {
          const passwordInput = document.getElementById(inputId);
          const eyeIcon = document.getElementById(iconId);
          const isPassword = passwordInput.type === "password";
          passwordInput.type = isPassword ? "text" : "password";
          eyeIcon.textContent = isPassword ? "visibility_off" : "visibility";
      }

  </script>

</@common.page>

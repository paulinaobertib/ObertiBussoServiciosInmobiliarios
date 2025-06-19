<#import "common.ftl" as common>
<@common.page title="Inicio de sesión">
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
        <div class="login-box">
            <img src="${url.resourcesPath}/logo.png" alt="Logo" class="login-logo" />
            <h2>Inicia sesión en tu cuenta</h2>

            <form action="${url.loginAction}" method="post">
                <input type="text" name="username" placeholder="Usuario o email" required />

                <div class="password-wrapper">
                    <input type="password" name="password" id="password" placeholder="Contraseña" required />
                    <button type="button" class="toggle-password" onclick="togglePassword()">
                        <span id="eye-icon" class="material-icons">visibility</span>
                    </button>
                </div>

                <div class="forgot-password centered">
                    <a href="${url.loginResetCredentialsUrl}">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

                <input type="submit" value="Entrar" />
            </form>

            <div class="divider">o inicia sesión con</div>

            <a class="google-button" href="https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?...">
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
                Google
            </a>

            <p class="register">
                ¿Nuevo usuario? <a href="${url.registrationUrl}">Registrarme</a>
            </p>
        </div>
    </div>

    <script>
        function togglePassword() {
            const passwordInput = document.getElementById("password");
            const eyeIcon = document.getElementById("eye-icon");
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            eyeIcon.textContent = isPassword ? "visibility_off" : "visibility";
        }
    </script>

</@common.page>

<#import "common.ftl" as common>
<@common.page title="Restablecer contraseña">
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
            <h2>Restablecer contraseña</h2>
            <form action="${url.loginAction}" method="post">
                <input type="text" name="username" placeholder="Usuario o email" required />
                <input type="submit" value="Enviar" />
            </form>
            <p class="register">
                <a href="${url.loginUrl}">Volver al inicio de sesión</a>
            </p>
        </div>
    </div>
</@common.page>

<#import "common.ftl" as common>
<@common.page title="Nueva contraseña">
    <div class="login-container">
        <div class="login-box">
            <h2>Establecer nueva contraseña</h2>
            <form action="${url.setNewPasswordAction}" method="post">
                <input type="password" name="newPassword" placeholder="Nueva contraseña" required />
                <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" required />
                <input type="submit" value="Enviar" />
            </form>
            <p class="register">
                <a href="${url.loginUrl}">Volver al inicio de sesión</a>
            </p>
        </div>
    </div>
</@common.page>


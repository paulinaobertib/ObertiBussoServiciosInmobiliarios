<#-- Importamos el layout que acabamos de crear -->
<#import "template.ftl" as layout>

<#-- Definimos el Asunto (Subject) del email -->
<#assign subject = kcSanitize(msg("passwordResetTitle", realmName))?no_esc>

<@layout.emailLayout> <#-- Todo lo que está aquí adentro irá en el <#nested> -->

    <p style="font-size: 16px; line-height: 1.5;">
        Hola, <strong>${(user.firstName!'')?no_esc}</strong>
    </p>

    <p style="font-size: 16px; line-height: 1.5;">
        Alguien solicitó restablecer la contraseña de tu cuenta.
    </p>
    <p style="font-size: 16px; line-height: 1.5;">
        Si no fuiste tú, puedes ignorar este correo. De lo contrario, haz clic en el botón de abajo para elegir una nueva contraseña.
    </p>
    <p style="font-size: 16px; line-height: 1.5;">
        Este enlace expirará en 5 minutos.
    </p>


    <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
        <a href="${link}" style="background-color: #EE671E; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold;">
            Restablecer mi contraseña
        </a>
    </div>

    <p style="font-size: 13px; color: #aaa; text-align: left; margin-top: 25px; line-height: 1.4;">
        Si tienes problemas con el botón, copia y pega la siguiente URL en tu navegador:
        <br/>
        <a href="${link}" style="color: #EE671E;">${link}</a>
    </p>

</@layout.emailLayout>
<#macro emailLayout>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${kcSanitize(msg("emailTitle", realmName))?no_esc}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">

<div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">

    <div style="background-color: #EE671E; padding: 20px; text-align: center;">
        <img src="https://storageimages.blob.core.windows.net/images/logo.png" alt="Logo Inmobiliaria" style="max-height: 60px; margin-bottom: 10px;">
        
        <#-- El título se insertará aquí, pero podemos poner uno genérico si no -->
        <#if subject??>
            <h1 style="color: #FFFFFF; font-size: 22px; margin: 0;">${subject}</h1>
        <#else>
            <h1 style="color: #FFFFFF; font-size: 22px; margin: 0;">${realmName}</h1>
        </#if>
    </div>

    <div style="padding: 25px; background-color: #f5f5f5;">
        
        <#-- AQUÍ ES DONDE KEYCLOAK INYECTARÁ EL CONTENIDO DE CADA EMAIL -->
        <#nested>

    </div>

    <div style="background-color: #FAB360; padding: 15px; text-align: center;">
        <small style="color: #333;">Oberti Busso Servicios Inmobiliarios</small>
    </div>
</div>
</body>
</html>
</#macro>
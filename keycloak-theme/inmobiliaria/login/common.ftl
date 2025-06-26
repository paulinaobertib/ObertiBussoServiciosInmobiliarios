<#macro page title>
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <link rel="icon" type="image/png" href="${url.resourcesPath}/miniatura.png" />
    <link rel="stylesheet" type="text/css" href="${url.resourcesPath}/css/styles.css"/>
</head>
<body>
    <#nested>
</body>
</html>
</#macro>

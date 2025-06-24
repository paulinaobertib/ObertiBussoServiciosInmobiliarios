<#import "common.ftl" as common>
<@common.page title="Cerrando sesión…">

  <div class="logout-container">
    <p>Cerrando tu sesión, por favor espera…</p>
  </div>

  <script>
    window.location.href = "http://localhost:8090/"
      + "?post_logout_redirect_uri="http://localhost:5173/";
  </script>

</@common.page>
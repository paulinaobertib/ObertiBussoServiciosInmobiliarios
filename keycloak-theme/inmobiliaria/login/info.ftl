<#import "common.ftl" as common>
<@common.page title="${message.summary}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

  <div class="login-layout">
    <div class="login-container">
      <div class="login-form-box">
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="Oberti Busso" />
        </div>

        <div class="success-container">
          <div class="success-icon">
            <span class="material-icons">check_circle</span>
          </div>
          
          <h2 class="welcome-title">¡Contraseña actualizada!</h2>
          
          <p class="welcome-desc">
            Tu contraseña se ha actualizado correctamente. 
            Ya podés iniciar sesión con tu nueva contraseña.
          </p>


          <div class="form-actions">
            <a href="${client.baseUrl}" class="btn-primary">Volver a la aplicación</a>
          </div>
        </div>
      </div>

      <div class="phrase-box">
        <p id="phrase-text">Buscá tu próximo hogar aquí</p>
      </div>
    </div>
  </div>

  <style>
    .success-container {
      text-align: center;
      padding: 2rem 0;
    }

    .success-icon {
      margin-bottom: 1.5rem;
    }

    .success-icon .material-icons {
      font-size: 4rem;
      color: #4caf50;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .welcome-desc {
      margin-bottom: 2rem;
    }
  </style>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
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
        if (el) {
          el.innerText = phrases[idx];
        }
        idx = (idx + 1) % phrases.length;
      }, 4000);
    });
  </script>
</@common.page>

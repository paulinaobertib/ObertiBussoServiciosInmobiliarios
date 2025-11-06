<#import "common.ftl" as common>
<@common.page title="${message.summary}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

  <div class="login-layout">
    <div class="login-container">
      <div class="login-form-box">
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="${msg('logoAltText')}" />
        </div>

        <div class="success-container">
          <div class="success-icon">
            <span class="material-icons">check_circle</span>
          </div>
          
          <h2 class="welcome-title">${msg('passwordUpdateSuccessTitle')}</h2>
          
          <p class="welcome-desc">
            ${msg('passwordUpdateSuccessDescription')}
          </p>


          <div class="form-actions">
            <a href="${client.baseUrl}" class="btn-primary">${msg('backToApplication')}</a>
          </div>
        </div>
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
</@common.page>

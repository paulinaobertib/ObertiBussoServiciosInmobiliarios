<#import "common.ftl" as common>
<@common.page title="Registrarse">

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="${url.resourcesPath}/styles.css">

  <div class="login-layout">

    <!-- Contenedor único: logo arriba, form en medio, frases abajo -->
    <div class="login-container">
      <div class="login-form-box">

        <!-- Logo -->
        <div class="login-logo">
          <img src="${url.resourcesPath}/logo.png" alt="Oberti Busso">
        </div>

        <h2 id="formTitle" class="welcome-title">Creá tu Cuenta</h2>

        <!-- Registro -->
        <form
          id="registerForm"
          action="${url.registrationAction}"
          method="post"
          class="auth-form"
          autocomplete="on"
        >

          <div class="input-row">
            <div>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value="${(user.firstName!'')}"
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value="${(user.lastName!'')}"
                placeholder="Apellido"
                required
              />
            </div>
          </div>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Correo electrónico"
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            value="${(user.email!'')}"
            readonly
            title="Debe ser un email válido (incluye @ y dominio)"
            required
          />

          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Teléfono"
            pattern="\d{10}"
            title="10 dígitos numéricos"
            required
          />

          <input
            type="text"
            id="username"
            name="username"
            placeholder="Usuario"
            value="${(user.username!'')}"
            readonly
            title="El nombre de usuario debe tener 3 dígitos como mínimo"
            minlength="3"
            required
          />

          <div class="password-wrapper">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Contraseña"
              minlength="8"
              title="Mínimo 8 caracteres"
              required
            />
            <button type="button" class="toggle-password" onclick="togglePassword(this)">
              <span class="material-icons">visibility</span>
            </button>
          </div>

          <div class="password-wrapper">
            <input
              type="password"
              id="password-confirm"
              name="password-confirm"
              placeholder="Confirmar contraseña"
              required
            />
            <button type="button" class="toggle-password" onclick="togglePassword(this)">
              <span class="material-icons">visibility</span>
            </button>
          </div>

          <div class="terms-section">
            <div class="terms-checkbox">
              <input type="checkbox" id="acceptTerms" name="terms_and_conditions" required />
              <label for="acceptTerms">
                <span>
                  Aceptar los 
                  <a href="https://www.inmobiliariaobertibusso.com.ar/policies" target="_blank" class="terms-link">
                    Términos y Condiciones
                  </a>
                </span>
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <span class="btn-label">Registrarse</span>
            </button>
          </div>
        </form>

        <!-- Banner de errores del servidor -->
        <#if message?has_content && (message.type == 'error' || message.type == 'warning')>
          <div class="server-error-banner ${message.type}" id="serverErrorBanner">
            <span class="material-icons">error_outline</span>
            <div class="error-content">
              <#assign localizedMessage = msg(message.summary)!message.summary>
              <strong id="serverErrorMessage" data-message-key="${message.summary}">${kcSanitize(localizedMessage)?no_esc}</strong>
            </div>
          </div>
        </#if>

        <!-- Footer toggle -->
        <div class="url-footer">
          <span id="urlFooter">
            ¿Ya tenés cuenta? <a href="${url.loginUrl}">Iniciar sesión</a>
          </span>
        </div>
      </div>

      <!-- Frases rotativas -->
      <div class="phrase-box">
        <p id="phrase-text">Buscá tu próximo hogar aquí</p>
      </div>
    </div>
  </div>

  <script>
    let toastTimer;

    function setButtonLoading(button, loadingText) {
      if (!button || button.classList.contains('is-loading')) return;
      const label = button.querySelector('.btn-label');
      if (label && !label.dataset.originalText) {
        label.dataset.originalText = label.textContent.trim();
      }
      if (label && loadingText) {
        label.textContent = loadingText;
      }
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      button.disabled = true;
    }

    const SERVER_ERROR_MAP = {
      invalidUsernameOrPasswordMessage: 'Usuario o contraseña incorrectos.',
      invalidUserMessage: 'Usuario inválido. Por favor verifica los datos ingresados.',
      accountDisabledMessage: 'Tu cuenta está deshabilitada. Contacta al administrador.',
      accountTemporarilyDisabledMessage: 'Tu cuenta está temporalmente bloqueada. Intenta más tarde.',
      expiredCodeMessage: 'El código ha expirado. Por favor solicita uno nuevo.',
      expiredActionMessage: 'La acción ha expirado. Por favor inicia el proceso nuevamente.',
      missingUsernameMessage: 'Debes ingresar tu usuario o email.',
      missingPasswordMessage: 'Debes ingresar tu contraseña.',
      usernameExistsMessage: 'El nombre de usuario ya está en uso. Elige uno diferente.',
      emailExistsMessage: 'El email ya está registrado. Inicia sesión o recupera tu contraseña.',
      invalidEmailMessage: 'El formato del email no es válido.',
      missingFirstNameMessage: 'Debes ingresar tu nombre.',
      missingLastNameMessage: 'Debes ingresar tu apellido.',
      missingEmailMessage: 'Debes ingresar tu email.',
      notMatchPasswordMessage: 'Las contraseñas no coinciden.',
      invalidPasswordMinLengthMessage: 'La contraseña es demasiado corta.',
      invalidPasswordMaxLengthMessage: 'La contraseña es demasiado larga.',
      invalidPasswordMinDigitsMessage: 'La contraseña debe contener más números.',
      invalidPasswordMinLowerCaseCharsMessage: 'La contraseña necesita más letras minúsculas.',
      invalidPasswordMinUpperCaseCharsMessage: 'La contraseña necesita más letras mayúsculas.',
      invalidPasswordMinSpecialCharsMessage: 'Agrega caracteres especiales a tu contraseña.',
      invalidPasswordNotUsernameMessage: 'La contraseña no puede ser igual al nombre de usuario.',
      invalidPasswordNotEmailMessage: 'La contraseña no puede ser igual al email.',
      invalidPasswordHistoryMessage: 'No puedes reutilizar una contraseña anterior.',
      invalidPasswordRegexPatternMessage: 'La contraseña no cumple con el patrón requerido.'
    };

    function ensureToastElements() {
      let toast = document.getElementById('toastMessage');
      if (!toast) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';

        toast = document.createElement('div');
        toast.id = 'toastMessage';
        toast.className = 'toast';
        toast.innerHTML = '<span class="material-icons toast-icon">error_outline</span><div class="toast-text"></div><button type="button" class="toast-close" aria-label="Cerrar aviso">x</button>';

        container.appendChild(toast);
        document.body.appendChild(container);

        toast.querySelector('.toast-close').addEventListener('click', hideToast);
      }
      return toast;
    }

    function showToast(message, options = {}) {
      const { type = 'error', duration = 6000 } = options;
      const toast = ensureToastElements();
      const container = toast.parentElement;
      const icon = toast.querySelector('.toast-icon');
      const text = toast.querySelector('.toast-text');

      toast.classList.remove('toast-error', 'toast-warning', 'toast-success', 'toast-info');
      toast.classList.add('toast-' + type);

      const iconMap = {
        error: 'error_outline',
        warning: 'warning',
        success: 'check_circle',
        info: 'info'
      };
      icon.innerText = iconMap[type] || iconMap.error;
      text.textContent = message;

      container.classList.add('visible');
      toast.classList.add('visible');

      if (toastTimer) {
        clearTimeout(toastTimer);
      }
      toastTimer = setTimeout(() => hideToast(), duration);
    }

    function hideToast() {
      const toast = document.getElementById('toastMessage');
      if (toast) {
        toast.classList.remove('visible');
        const container = toast.parentElement;
        if (container) {
          container.classList.remove('visible');
        }
      }
      if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
      }
    }

    function translateServerMessage(key, fallback) {
      if (!key) {
        return fallback || '';
      }
      if (SERVER_ERROR_MAP[key]) {
        return SERVER_ERROR_MAP[key];
      }
      // Manejar concatenaciones de claves (ej: emailExistsMessageusernameExistsMessage)
      const regex = /([a-zA-Z]+Message)/g;
      const matches = key.match(regex);
      if (matches && matches.length > 0) {
        const translatedParts = matches.map(match => SERVER_ERROR_MAP[match] || match);
        return translatedParts.join(' ');
      }
      return SERVER_ERROR_MAP[key] || fallback || key;
    }

    // Toggle visibilidad de contraseña
    function togglePassword(btn) {
      const wrapper = btn.closest('.password-wrapper');
      const input = wrapper.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.querySelector('.material-icons').innerText = 'visibility_off';
      } else {
        input.type = 'password';
        btn.querySelector('.material-icons').innerText = 'visibility';
      }
    }

    // Validación completa del formulario de registro
    function validateRegisterForm() {
      const firstNameInput = document.getElementById('firstName');
      const lastNameInput = document.getElementById('lastName');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      const passwordConfirmInput = document.getElementById('password-confirm');

      const firstName = firstNameInput.value.trim();
      const lastName = lastNameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      const passwordConfirm = passwordConfirmInput.value;

      // Limpiar estilos de error previos
      [firstNameInput, lastNameInput, emailInput, phoneInput, usernameInput, passwordInput, passwordConfirmInput].forEach(input => {
        if (input) input.style.borderColor = '';
      });

      // Validar nombre
      if (!firstName) {
        showToast('Por favor ingresa tu nombre.', { type: 'error' });
        firstNameInput.style.borderColor = '#ff6b6b';
        firstNameInput.focus();
        return false;
      }
      if (firstName.length < 2) {
        showToast('El nombre debe tener al menos 2 caracteres.', { type: 'error' });
        firstNameInput.style.borderColor = '#ff6b6b';
        firstNameInput.focus();
        return false;
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(firstName)) {
        showToast('El nombre solo puede contener letras.', { type: 'error' });
        firstNameInput.style.borderColor = '#ff6b6b';
        firstNameInput.focus();
        return false;
      }

      // Validar apellido
      if (!lastName) {
        showToast('Por favor ingresa tu apellido.', { type: 'error' });
        lastNameInput.style.borderColor = '#ff6b6b';
        lastNameInput.focus();
        return false;
      }
      if (lastName.length < 2) {
        showToast('El apellido debe tener al menos 2 caracteres.', { type: 'error' });
        lastNameInput.style.borderColor = '#ff6b6b';
        lastNameInput.focus();
        return false;
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)) {
        showToast('El apellido solo puede contener letras.', { type: 'error' });
        lastNameInput.style.borderColor = '#ff6b6b';
        lastNameInput.focus();
        return false;
      }

      // Validar email
      if (!email) {
        showToast('Por favor ingresa tu correo electrónico.', { type: 'error' });
        emailInput.style.borderColor = '#ff6b6b';
        emailInput.focus();
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('El email no es válido. Debe incluir @ y un dominio (ej: usuario@dominio.com).', { type: 'error' });
        emailInput.style.borderColor = '#ff6b6b';
        emailInput.focus();
        return false;
      }

      // Validación adicional: dominios comunes sospechosos (opcional, no bloquea)
      const suspiciousDomains = ['test.com', 'example.com', 'fake.com', 'temp.com'];
      const domain = email.split('@')[1];
      if (suspiciousDomains.includes(domain)) {
        showToast('Advertencia: El dominio "' + domain + '" parece ser de prueba.', { type: 'warning', duration: 5000 });
      }

      // Validar teléfono
      if (!phone) {
        showToast('Por favor ingresa tu teléfono.', { type: 'error' });
        phoneInput.style.borderColor = '#ff6b6b';
        phoneInput.focus();
        return false;
      }

      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(phone)) {
        showToast('El teléfono debe contener entre 10 y 15 dígitos numéricos. No incluyas espacios, guiones ni paréntesis.', { type: 'error' });
        phoneInput.style.borderColor = '#ff6b6b';
        phoneInput.focus();
        return false;
      }

      // Validar usuario
      if (!username) {
        showToast('Por favor ingresa un nombre de usuario.', { type: 'error' });
        usernameInput.style.borderColor = '#ff6b6b';
        usernameInput.focus();
        return false;
      }

      if (username.length < 3) {
        showToast('El nombre de usuario debe tener al menos 3 caracteres.', { type: 'error' });
        usernameInput.style.borderColor = '#ff6b6b';
        usernameInput.focus();
        return false;
      }

      if (username.length > 20) {
        showToast('El nombre de usuario no puede tener más de 20 caracteres.', { type: 'error' });
        usernameInput.style.borderColor = '#ff6b6b';
        usernameInput.focus();
        return false;
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        showToast('El nombre de usuario solo puede contener letras (a-z, A-Z), números (0-9), guiones (-) y guiones bajos (_).', { type: 'error' });
        usernameInput.style.borderColor = '#ff6b6b';
        usernameInput.focus();
        return false;
      }

      // Validar que no empiece con número
      if (/^\d/.test(username)) {
        showToast('El nombre de usuario no puede empezar con un número.', { type: 'error' });
        usernameInput.style.borderColor = '#ff6b6b';
        usernameInput.focus();
        return false;
      }

      // Validar contraseña
      if (!password) {
        showToast('Por favor ingresa una contraseña.', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }

      if (password.length < 8) {
        showToast('La contraseña debe tener al menos 8 caracteres.', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }

      if (password.length > 64) {
        showToast('La contraseña no puede tener más de 64 caracteres.', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }

      // Validar que incluya mayúsculas
      if (!/[A-Z]/.test(password)) {
        showToast('La contraseña debe incluir al menos una letra MAYÚSCULA (A-Z).', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }

      // Validar que incluya minúsculas
      if (!/[a-z]/.test(password)) {
        showToast('La contraseña debe incluir al menos una letra minúscula (a-z).', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }

      // Validar que incluya números
      if (!/\d/.test(password)) {
        showToast('La contraseña debe incluir al menos un número (0-9).', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }

      // Validar que no contenga el usuario o email
      if (password.toLowerCase().includes(username.toLowerCase())) {
        showToast('La contraseña no puede contener tu nombre de usuario.', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }

      if (password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
        showToast('La contraseña no puede contener tu dirección de email.', { type: 'error' });
        passwordInput.style.borderColor = '#ff6b6b';
        passwordInput.focus();
        return false;
      }

      // Validar caracteres especiales (recomendación, no bloqueante)
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        showToast('Recomendación: Es más seguro incluir al menos un carácter especial en tu contraseña.', { type: 'info', duration: 5000 });
      }

      // Validar confirmación de contraseña
      if (!passwordConfirm) {
        showToast('Por favor confirma tu contraseña.', { type: 'error' });
        passwordConfirmInput.style.borderColor = '#ff6b6b';
        passwordConfirmInput.focus();
        return false;
      }

      if (password !== passwordConfirm) {
        showToast('Las contraseñas no coinciden. Por favor verifícalas e intenta nuevamente.', { type: 'error' });
        passwordConfirmInput.style.borderColor = '#ff6b6b';
        passwordInput.style.borderColor = '#ff6b6b';
        passwordConfirmInput.focus();
        return false;
      }

      // Validar aceptación de Términos y Condiciones
      const acceptTerms = document.getElementById('acceptTerms');
      if (!acceptTerms.checked) {
        showToast('Debes aceptar los Términos y Condiciones para registrarte.', { type: 'error' });
        acceptTerms.focus();
        return false;
      }

      return true;
    }

    document.addEventListener('DOMContentLoaded', () => {
      ensureToastElements();

      const serverMessageElement = document.getElementById('serverErrorMessage');
      if (serverMessageElement) {
        const serverKey = serverMessageElement.dataset.messageKey;
        const fallback = serverMessageElement.textContent.trim();
        const translated = translateServerMessage(serverKey, fallback);
        serverMessageElement.textContent = translated;
      }

      // Auto-ocultar banner de error después de 10 segundos
      const serverBanner = document.getElementById('serverErrorBanner');
      if (serverBanner) {
        setTimeout(() => {
          serverBanner.style.transition = 'opacity 0.5s';
          serverBanner.style.opacity = '0';
          setTimeout(() => serverBanner.remove(), 500);
        }, 10000);
      }

      // Rotación de frases
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
        el.innerText = phrases[idx];
        idx = (idx + 1) % phrases.length;
      }, 4000);

      // Prevenir submit automático si hay errores de validación
      const form = document.getElementById('registerForm');
      const submitButton = form.querySelector('.btn-primary');

      form.addEventListener('submit', (e) => {
        const isValid = validateRegisterForm();
        if (!isValid) {
          e.preventDefault(); // Detiene envío si hay error
          return false;
        }
        setButtonLoading(submitButton, 'Registrando...');
      });

      // Validación en tiempo real: mostrar feedback visual
      const passwordInput = document.getElementById('password');
      const passwordConfirmInput = document.getElementById('password-confirm');

      passwordConfirmInput.addEventListener('blur', () => {
        if (passwordConfirmInput.value && passwordInput.value !== passwordConfirmInput.value) {
          passwordConfirmInput.style.borderColor = '#ff6b6b';
        } else if (passwordConfirmInput.value) {
          passwordConfirmInput.style.borderColor = '#4caf50';
        } else {
          passwordConfirmInput.style.borderColor = '';
        }
      });

      // Limpiar bordes rojos al empezar a escribir
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          input.style.borderColor = '';
        });
      });
    });
  </script>

</@common.page>

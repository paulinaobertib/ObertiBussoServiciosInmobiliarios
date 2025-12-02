/**
 * Login page JavaScript functionality
 * Handles button loading states, password toggle, Google login, and error banners
 */

document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
    const form = document.getElementById('loginForm');
    const loginButton = form.querySelector('.btn-primary');

    form.addEventListener('submit', (e) => {
        // Add loading state to login button
        if (loginButton && !loginButton.classList.contains('is-loading')) {
            loginButton.classList.add('is-loading');
            // Fallback: remove loading after 3 seconds
            setTimeout(() => {
                loginButton.classList.remove('is-loading');
            }, 3000);
        }
        return true; // Allow form submission
    });

    // Button loading states for all buttons
    const buttons = document.querySelectorAll('.btn-primary, .google-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('is-loading')) {
                this.classList.add('is-loading');
                // Remove loading state after 3 seconds as fallback
                setTimeout(() => {
                    this.classList.remove('is-loading');
                }, 3000);
            }
        });
    });

    // Password toggle functionality
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('.material-icons');

            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    });

    // Google login button handler
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        const loginUrl = googleBtn.dataset.loginUrl;
        if (!loginUrl) {
            googleBtn.disabled = true;
            googleBtn.setAttribute('aria-disabled', 'true');
            googleBtn.style.display = 'none';
        } else {
            let googleLoadingTimeout;
            googleBtn.addEventListener('click', () => {
                // Add loading state
                googleBtn.classList.add('is-loading');

                // Timeout de 10 segundos para el loading de Google
                googleLoadingTimeout = setTimeout(() => {
                    googleBtn.classList.remove('is-loading');
                }, 10000);

                window.location.assign(loginUrl);
            });

            // Limpiar el timeout si el usuario vuelve a la página
            window.addEventListener('pageshow', () => {
                if (googleLoadingTimeout) {
                    clearTimeout(googleLoadingTimeout);
                }
                googleBtn.classList.remove('is-loading');
            });
        }
    }

    // Error banner auto-hide functionality
    const errorBanners = document.querySelectorAll('.kc-error-banner, .server-error-banner');
    errorBanners.forEach(banner => {
        // Auto-hide after 8 seconds with fade effect (matching original behavior)
        setTimeout(() => {
            banner.style.transition = 'opacity 0.5s';
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 500);
        }, 8000);

        // Allow manual close
        banner.addEventListener('click', function() {
            this.style.display = 'none';
        });
    });

    // Form validation feedback
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            // Remove any existing validation classes
            this.classList.remove('error', 'success');

            // Basic validation
            if (this.value.trim() === '' && this.hasAttribute('required')) {
                this.classList.add('error');
            } else if (this.value.trim() !== '') {
                this.classList.add('success');
            }
        });
    });

    // Password requirements toggle
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const requirements = input.parentElement.querySelector('.password-requirements');

        if (requirements) {
            input.addEventListener('focus', function() {
                requirements.classList.add('active');
            });

            input.addEventListener('blur', function() {
                setTimeout(() => {
                    requirements.classList.remove('active');
                }, 150);
            });
        }
    });
});
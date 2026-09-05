/**
 * BRIEFING CAPISTA - Authentication Service for Designer Area
 * Protects the designer dashboard with authorized credentials.
 */

const DESIGNER_CREDENTIALS = {
  email: 'lailapauladesigner@gmail.com',
  password: 'Luck1010#'
};

const AUTH_STORAGE_KEY = 'capista_designer_auth_v1';

class AuthService {
  constructor() {
    this.isAuthenticatedState = this.checkStoredAuth();
  }

  checkStoredAuth() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return data && data.authenticated === true && data.email === DESIGNER_CREDENTIALS.email;
      }
    } catch (e) {
      console.warn('Auth check error:', e);
    }
    return false;
  }

  isAuthenticated() {
    return this.isAuthenticatedState;
  }

  login(email, password, remember = true) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (cleanEmail === DESIGNER_CREDENTIALS.email.toLowerCase() && cleanPass === DESIGNER_CREDENTIALS.password) {
      this.isAuthenticatedState = true;
      const sessionData = JSON.stringify({
        authenticated: true,
        email: DESIGNER_CREDENTIALS.email,
        loggedInAt: new Date().toISOString()
      });

      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, sessionData);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, sessionData);
      }
      return { success: true };
    }

    return { 
      success: false, 
      message: 'E-mail ou senha incorretos. Verifique suas credenciais de designer.' 
    };
  }

  logout() {
    this.isAuthenticatedState = false;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    
    // Redirect to client briefing
    if (window.briefingApp) {
      window.briefingApp.switchView('client');
      window.briefingApp.goToStep(0);
    }
    this.updateUI();
  }

  openLoginModal() {
    const modal = document.getElementById('designer-login-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      const errBox = document.getElementById('login-error-msg');
      
      if (errBox) errBox.classList.add('hidden');
      if (emailInput) {
        emailInput.value = '';
        setTimeout(() => emailInput.focus(), 100);
      }
      if (passInput) passInput.value = '';
    }
  }

  closeLoginModal() {
    const modal = document.getElementById('designer-login-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  handleLoginFormSubmit() {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const rememberCheckbox = document.getElementById('login-remember');
    const errBox = document.getElementById('login-error-msg');
    const errText = document.getElementById('login-error-text');

    const email = emailInput ? emailInput.value : '';
    const pass = passInput ? passInput.value : '';
    const remember = rememberCheckbox ? rememberCheckbox.checked : true;

    const res = this.login(email, pass, remember);

    if (res.success) {
      this.closeLoginModal();
      this.updateUI();
      if (window.briefingApp) {
        window.briefingApp.switchView('designer');
      }
    } else {
      if (errBox && errText) {
        errText.textContent = res.message;
        errBox.classList.remove('hidden');
      }
      if (passInput) {
        passInput.value = '';
        passInput.focus();
      }
    }
  }

  updateUI() {
    const userBadge = document.getElementById('designer-user-badge');
    const userEmailSpan = document.getElementById('designer-user-email');
    
    if (this.isAuthenticated()) {
      if (userBadge) userBadge.classList.remove('hidden');
      if (userEmailSpan) userEmailSpan.textContent = DESIGNER_CREDENTIALS.email;
    } else {
      if (userBadge) userBadge.classList.add('hidden');
    }
  }
}

window.authService = new AuthService();

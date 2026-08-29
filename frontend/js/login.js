document.addEventListener('DOMContentLoaded', () => {
  const loginOverlay = document.getElementById('login-overlay');
  const appContent = document.getElementById('app-content');
  const loginBtn = document.getElementById('login-btn');
  const loginName = document.getElementById('login-name');
  const loginPhone = document.getElementById('login-phone');
  const loginFeedback = document.getElementById('login-feedback');

  // Check if user is already logged in
  const currentUser = localStorage.getItem('csah_user');
  if (currentUser) {
    unlockDashboard();
  }

  loginBtn.addEventListener('click', handleLogin);

  function handleLogin() {
    const name = loginName.value.trim();
    const phone = loginPhone.value.trim();

    if (!name || !phone) {
      showError("Please enter both your name and phone number.");
      return;
    }

    // Phone Validation (Indian numbers start with 6,7,8,9)
    let cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.slice(3);
    else if (cleanPhone.startsWith('91') && cleanPhone.length > 10) cleanPhone = cleanPhone.slice(2);
    else if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);

    // Reject if it starts with 1-5
    if (/^[1-5]/.test(cleanPhone)) {
      showError("Invalid number or credentials");
      return;
    }
    
    // Also basic length validation for realism (10 digits)
    if (cleanPhone.length !== 10) {
      showError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Login successful
    const userSession = {
      name: name,
      phone: cleanPhone,
      timestamp: new Date().getTime()
    };

    localStorage.setItem('csah_user', JSON.stringify(userSession));
    
    // Animate out
    loginOverlay.style.opacity = '0';
    setTimeout(() => {
      unlockDashboard();
    }, 500); // Wait for transition
  }

  function showError(msg) {
    loginFeedback.textContent = msg;
    loginFeedback.className = "sub-feedback error";
    loginFeedback.classList.remove("hidden");

    setTimeout(() => {
      loginFeedback.classList.add("hidden");
    }, 4000);
  }

  function unlockDashboard() {
    loginOverlay.classList.add('hidden');
    appContent.classList.remove('hidden');
  }
});

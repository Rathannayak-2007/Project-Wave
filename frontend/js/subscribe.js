/**
 * SMS Subscription panel - handles subscribe/unsubscribe form
 */

async function handleSubscribe(event) {
  event.preventDefault();

  const phone = document.getElementById("sub-phone").value.trim();
  const locationId = document.getElementById("sub-location").value;
  const feedback = document.getElementById("sub-feedback");

  if (!phone || !locationId) {
    showFeedback(feedback, "Please enter your phone number and select a location.", "error");
    return;
  }

  let cleanPhone = phone.replace(/[\s-]/g, '');
  if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.slice(3);
  else if (cleanPhone.startsWith('91') && cleanPhone.length > 10) cleanPhone = cleanPhone.slice(2);
  else if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);

  if (/^[1-5]/.test(cleanPhone)) {
    showFeedback(feedback, "Invalid number or credentials", "error");
    return;
  }


  try {
    const res = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, location_id: locationId }),
    });
    const data = await res.json();

    if (res.ok) {
      showFeedback(feedback, "Subscribed! You'll receive SMS alerts for this location.", "success");
      document.getElementById("sub-phone").value = "";
    } else {
      showFeedback(feedback, data.error || "Subscription failed.", "error");
    }
  } catch (err) {
    showFeedback(feedback, "Network error. Is the backend running?", "error");
  }
}

async function handleUnsubscribe(event) {
  event.preventDefault();

  const phone = document.getElementById("sub-phone").value.trim();
  const locationId = document.getElementById("sub-location").value;
  const feedback = document.getElementById("sub-feedback");

  if (!phone) {
    showFeedback(feedback, "Enter the phone number to unsubscribe.", "error");
    return;
  }

  let cleanPhone = phone.replace(/[\s-]/g, '');
  if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.slice(3);
  else if (cleanPhone.startsWith('91') && cleanPhone.length > 10) cleanPhone = cleanPhone.slice(2);
  else if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);

  if (/^[1-5]/.test(cleanPhone)) {
    showFeedback(feedback, "Invalid number or credentials", "error");
    return;
  }


  try {
    const res = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, location_id: locationId || null }),
    });
    const data = await res.json();

    if (res.ok) {
      showFeedback(feedback, "Unsubscribed successfully.", "success");
      document.getElementById("sub-phone").value = "";
    } else {
      showFeedback(feedback, data.error || "Unsubscribe failed.", "error");
    }
  } catch (err) {
    showFeedback(feedback, "Network error. Is the backend running?", "error");
  }
}

function showFeedback(el, message, type) {
  el.textContent = message;
  el.className = "sub-feedback " + type;
  el.classList.remove("hidden");

  // Auto-hide after 5 seconds
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.classList.add("hidden");
  }, 5000);
}

/**
 * Populate the location dropdown from the risk data that's already loaded.
 * Called from map.js after data is fetched.
 */
function populateLocationDropdown(locations) {
  const select = document.getElementById("sub-location");
  if (!select) return;

  // Keep the placeholder option, clear the rest
  select.innerHTML = '<option value="">-- Select location --</option>';

  locations.forEach((loc) => {
    const option = document.createElement("option");
    option.value = loc.id;
    option.textContent = loc.name;
    select.appendChild(option);
  });
}

// Wire up form buttons when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const subscribeBtn = document.getElementById("subscribe-btn");
  const unsubscribeBtn = document.getElementById("unsubscribe-btn");

  if (subscribeBtn) subscribeBtn.addEventListener("click", handleSubscribe);
  if (unsubscribeBtn) unsubscribeBtn.addEventListener("click", handleUnsubscribe);
});

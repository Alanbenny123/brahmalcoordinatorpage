function login() {
  const event_id = document.getElementById("event_id").value.trim();
  const event_pass = document.getElementById("event_pass").value.trim();

  if (!event_id || !event_pass) {
    document.getElementById("msg").innerText = "Fill all fields";
    return;
  }

  // Show loading state
  const msgEl = document.getElementById("msg");
  msgEl.style.color = "#fff";
  msgEl.innerText = "Logging in...";

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_id, event_pass })
  })
  .then(async res => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    return res.json();
  })
  .then(data => {
    if (data.success) {
      // ✅ STORE VALUES FROM SERVER
      localStorage.setItem("event_id", event_id);
      localStorage.setItem("event_name", data.event_name);
      if (data.amount) {
        localStorage.setItem("event_amount", data.amount);
      }

      msgEl.style.color = "#90EE90";
      msgEl.innerText = "Login successful!";
      
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } else {
      msgEl.style.color = "#ffb3b3";
      msgEl.innerText = data.message || "Login failed";
    }
  })
  .catch(err => {
    console.error("Login error:", err);
    msgEl.style.color = "#ffb3b3";
    msgEl.innerText = err.message || "Server error";
  });
}

// Allow Enter key to submit
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        login();
      }
    });
  });
});

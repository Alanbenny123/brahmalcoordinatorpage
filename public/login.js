function login() {
  const event_id = document.getElementById("event_id").value.trim();
  const event_pass = document.getElementById("event_pass").value.trim();

  if (!event_id || !event_pass) {
    document.getElementById("msg").innerText = "Fill all fields";
    return;
  }

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_id, event_pass })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {

      // ✅ STORE VALUES FROM SERVER (IMPORTANT)
      localStorage.setItem("event_id", data.event_id);
      localStorage.setItem("event_name", data.event_name);

      window.location.href = "dashboard.html";
    } else {
      document.getElementById("msg").innerText = data.message;
    }
  })
  .catch(() => {
    document.getElementById("msg").innerText = "Server error";
  });
}

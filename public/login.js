function login() {
  const event_id = document.getElementById("event_id").value.trim();
  const event_pass = document.getElementById("event_pass").value.trim();
  const msg = document.getElementById("msg");

  if (!event_id || !event_pass) {
    msg.innerText = "Please fill both fields";
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
      localStorage.setItem("event_id", event_id); // store the event ID for dashboard
      window.location.href = "dashboard.html";
    } else {
      msg.innerText = data.message;
    }
  })
  .catch(err => {
    console.error(err);
    msg.innerText = "Server error";
  });
}

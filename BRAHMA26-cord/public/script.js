/* ======================
   DASHBOARD / SCAN / ATTENDANCE SCRIPT
   ====================== */

/* Get current event_id from localStorage */
const event_id = localStorage.getItem("event_id");

/* ----------------------
   DASHBOARD COUNT
---------------------- */
if (document.getElementById("count")) {
  if (!event_id) {
    document.getElementById("count").innerText = "Login again";
  } else {
    fetch(`/count/${event_id}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("count").innerText = data.count;
      })
      .catch(err => {
        console.error(err);
        document.getElementById("count").innerText = "Error";
      });
  }
}

/* ----------------------
   SCAN TICKET
---------------------- */
function scanTicket() {
  const ticket_id = document.getElementById("ticket_id").value.trim();
  const result = document.getElementById("result");

  if (!ticket_id) {
    result.innerText = "Please enter Ticket ID";
    return;
  }

  if (!event_id) {
    result.innerText = "Session expired. Login again.";
    return;
  }

  result.innerText = "Scanning...";

  fetch("/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ticket_id: ticket_id,
      event_id: event_id
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        result.innerText = "✅ Welcome " + data.student_name;
      } else {
        result.innerText = "❌ " + data.message;
      }
    })
    .catch(err => {
      console.error(err);
      result.innerText = "Server error";
    });
}

/* ----------------------
   ATTENDANCE LIST
---------------------- */
if (document.getElementById("attendance_list")) {
  if (!event_id) return;

  fetch(`/attendance/${event_id}`)
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById("attendance_list");
      ul.innerHTML = ""; // clear previous items
      data.forEach(name => {
        const li = document.createElement("li");
        li.innerText = name;
        ul.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
    });
}
    
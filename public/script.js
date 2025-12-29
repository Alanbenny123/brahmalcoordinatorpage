/* ======================
   DASHBOARD / SCAN / ATTENDANCE SCRIPT
   ====================== */

/* Get current Event_Id from localStorage */
const Event_Id = localStorage.getItem("Event_Id");

/* ----------------------
   DASHBOARD COUNT
---------------------- */
if (document.getElementById("count")) {
  if (!Event_Id) {
    document.getElementById("count").innerText = "Login again";
  } else {
    fetch(`/count/${Event_Id}`)
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

  if (!Event_Id) {
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
      Event_Id: Event_Id
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
  if (!Event_Id) return;

  fetch(`/attendance/${Event_Id}`)
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
    
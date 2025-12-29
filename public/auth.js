// Authentication check for protected pages
(function() {
  const event_id = localStorage.getItem("event_id");
  const event_name = localStorage.getItem("event_name");
  
  if (!event_id || !event_name) {
    alert("Please login first");
    window.location.href = "/login.html";
    throw new Error("Not authenticated");
  }
})();



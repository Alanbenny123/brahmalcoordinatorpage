const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const db = require("./firebase");

const app = express();

/* =======================
   MIDDLEWARE
   ======================= */
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

/* =======================
   ROOT ROUTE
   ======================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* =======================
   LOGIN (EVENT COORDINATOR)
   ======================= */
app.post("/login", async (req, res) => {
  try {
    const { event_id, event_pass } = req.body;

    if (!event_id || !event_pass) {
      return res.status(400).json({
        success: false,
        message: "Event ID and Password are required"
      });
    }

    // Query events collection using event_id field
    const snapshot = await db
      .collection("events")
      .where("event_id", "==", event_id)
      .get();

    if (snapshot.empty) {
      return res.json({
        success: false,
        message: "Event not found"
      });
    }

    const eventDoc = snapshot.docs[0];
    const eventData = eventDoc.data();

    if (eventData.event_pass !== event_pass) {
      return res.json({
        success: false,
        message: "Wrong password"
      });
    }

    // ✅ UPDATED RESPONSE (event_id + event_name)
    res.json({
      success: true,
      event_id: event_id,
      event_name: eventData.event_name
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =======================
   DASHBOARD COUNT
   ======================= */
app.get("/count/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;

    const snapshot = await db
      .collection("tickets")
      .where("event_id", "==", event_id)
      .get();

    res.json({ count: snapshot.size });

  } catch (error) {
    console.error("COUNT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   SCAN TICKET
   ======================= */
app.post("/scan", async (req, res) => {
  try {
    const { ticket_id, event_id } = req.body;

    if (!ticket_id || !event_id) {
      return res.json({
        success: false,
        message: "Ticket ID or Event ID missing"
      });
    }

    // Match ticket_id + event_id fields
    const snapshot = await db
      .collection("tickets")
      .where("ticket_id", "==", ticket_id)
      .where("event_id", "==", event_id)
      .get();

    if (snapshot.empty) {
      return res.json({
        success: false,
        message: "Ticket does not belong to this event or does not exist"
      });
    }

    const ticketDoc = snapshot.docs[0];
    const ticket = ticketDoc.data();

    if (ticket.usage === true) {
      return res.json({
        success: false,
        message: "Ticket already used"
      });
    }

    await ticketDoc.ref.update({ usage: true });

    res.json({
      success: true,
      message: "Attendance marked",
      student_name: ticket.student_name
    });

  } catch (error) {
    console.error("SCAN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =======================
   ATTENDANCE REPORT
   ======================= */
app.get("/attendance/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;

    const snapshot = await db
      .collection("tickets")
      .where("event_id", "==", event_id)
      .where("usage", "==", true)
      .get();

    let students = [];
    snapshot.forEach(doc => {
      students.push(doc.data().student_name);
    });

    res.json(students);

  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

/* ===========================
   DASHBOARD ALL TICKETS
   =========================== */
app.get("/tickets/:event_id", async (req, res) => {
  try {
    const snapshot = await db
      .collection("tickets")
      .where("event_id", "==", req.params.event_id)
      .get();

    let tickets = [];
    snapshot.forEach(doc => tickets.push(doc.data()));

    res.json(tickets);

  } catch (error) {
    console.error("TICKETS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   START SERVER
   ======================= */
app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});

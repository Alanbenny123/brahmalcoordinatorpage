const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const {
  getEventByEventId,
  getTicketByIds,
  countTicketsByEventId,
  getTicketsByEventId,
  getAttendedTickets,
  markTicketAsUsed,
  getCoordinatorsByEventId,
  getEventsByCoordinator
} = require("./appwrite");

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

    // Query events collection using Appwrite
    const event = await getEventByEventId(event_id);

    if (!event) {
      return res.json({
        success: false,
        message: "Event not found"
      });
    }

    if (event.event_pass !== event_pass) {
      return res.json({
        success: false,
        message: "Wrong password"
      });
    }

    // Get coordinators for this event
    const coordinators = await getCoordinatorsByEventId(event_id);
    
    // Generate UUID session token
    const { v4: uuidv4 } = require('uuid');
    const sessionToken = uuidv4();
    
    res.json({
      success: true,
      event_id: event.event_id,
      event_name: event.event_name,
      coordinators: coordinators,
      session_token: sessionToken,
      event_data: {
        venue: event.venue,
        date: event.date,
        time: event.time,
        status: event.completed ? 'completed' : (new Date(event.date) > new Date() ? 'upcoming' : 'live')
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    const errorMessage = error.message || "Server error";
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? errorMessage : "Server error"
    });
  }
});

/* =======================
   DASHBOARD COUNT
   ======================= */
app.get("/count/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;

    const count = await countTicketsByEventId(event_id);

    res.json({ count });

  } catch (error) {
    console.error("COUNT ERROR:", error);
    const errorMessage = error.message || "Server error";
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? errorMessage : "Server error" 
    });
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

    // Query tickets collection using Appwrite
    const ticket = await getTicketByIds(ticket_id, event_id);

    if (!ticket) {
      return res.json({
        success: false,
        message: "Ticket does not belong to this event or does not exist"
      });
    }

    if (ticket.usage === true) {
      return res.json({
        success: false,
        message: "Ticket already used"
      });
    }

    // Mark ticket as used
    await markTicketAsUsed(ticket.$id);

    res.json({
      success: true,
      message: "Attendance marked",
      student_name: ticket.student_name
    });

  } catch (error) {
    console.error("SCAN ERROR:", error);
    const errorMessage = error.message || "Server error";
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? errorMessage : "Server error"
    });
  }
});

/* =======================
   ATTENDANCE REPORT
   ======================= */
app.get("/attendance/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;

    const tickets = await getAttendedTickets(event_id);

    let students = [];
    tickets.forEach(ticket => {
      students.push(ticket.student_name);
    });

    res.json(students);

  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    const errorMessage = error.message || "Server error";
    res.status(500).json({
      message: process.env.NODE_ENV === 'development' ? errorMessage : "Server error"
    });
  }
});

/*
Dashboard additional stuffs 
 */

app.get("/tickets/:event_id", async (req, res) => {
  try {
    const tickets = await getTicketsByEventId(req.params.event_id);
    res.json(tickets);
  } catch (error) {
    console.error("TICKETS ERROR:", error);
    const errorMessage = error.message || "Server error";
    res.status(500).json({
      message: process.env.NODE_ENV === 'development' ? errorMessage : "Server error"
    });
  }
});

/* =======================
   GET ASSIGNED EVENTS FOR COORDINATOR
   ======================= */
app.get("/coord/events", async (req, res) => {
  try {
    const { coordinator_name } = req.query;
    
    if (!coordinator_name) {
      return res.status(400).json({
        success: false,
        message: "Coordinator name is required"
      });
    }

    // Get all events where coordinator[] array contains this coordinator
    const events = await getEventsByCoordinator(coordinator_name);
    
    // Format events for mobile UI
    const formattedEvents = events.map(event => ({
      $id: event.$id,
      event_id: event.event_id,
      event_name: event.event_name,
      venue: event.venue || '',
      date: event.date || '',
      time: event.time || '',
      status: event.completed ? 'completed' : 
              (new Date(event.date) > new Date() ? 'upcoming' : 'live'),
      poster: event.poster || null
    }));

    res.json({
      success: true,
      events: formattedEvents
    });

  } catch (error) {
    console.error("COORD EVENTS ERROR:", error);
    const errorMessage = error.message || "Server error";
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? errorMessage : "Server error"
    });
  }
});

/* =======================
   START SERVER
   ======================= */
app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});

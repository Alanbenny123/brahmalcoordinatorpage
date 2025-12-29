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
  markTicketAsUsed
} = require("./appwrite");

const app = express();

/* =======================
   MIDDLEWARE
   ======================= */
// CORS
app.use(cors());

// Body parser with size limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Static files
app.use(express.static("public"));

// Error handling for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  next(err);
});

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

    res.json({
      success: true,
      event_name: event.event_name,
      amount: event.amount || null
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
   START SERVER
   ======================= */
const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log("✅ Server running at http://localhost:3000");
});

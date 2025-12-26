const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY', 'APPWRITE_DATABASE_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('📝 Please create a .env file with the required Appwrite credentials.');
    console.error('📖 See APPWRITE_SETUP.md for setup instructions.');
    process.exit(1);
}

// Initialize Appwrite client
const client = new Client();

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Database and Collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTIONS = {
    EVENTS: process.env.APPWRITE_COLLECTION_EVENTS || 'events',
    TICKETS: process.env.APPWRITE_COLLECTION_TICKETS || 'tickets',
    USERS: process.env.APPWRITE_COLLECTION_USERS || 'users',
    ATTENDANCE: process.env.APPWRITE_COLLECTION_ATTENDANCE || 'attendance',
    COORDINATORS: process.env.APPWRITE_COLLECTION_COORDINATORS || 'event_coordinators'
};

// Helper function to query events by event_id
async function getEventByEventId(event_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.EVENTS,
            [Query.equal('event_id', event_id)]
        );
        return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
}

// Helper function to query tickets by ticket_id and event_id
async function getTicketByIds(ticket_id, event_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TICKETS,
            [
                Query.equal('ticket_id', ticket_id),
                Query.equal('event_id', event_id)
            ]
        );
        return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
        console.error('Error fetching ticket:', error);
        throw error;
    }
}

// Helper function to get ticket by ticket_id only (to check if it belongs to different event)
async function getTicketByTicketId(ticket_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TICKETS,
            [Query.equal('ticket_id', ticket_id)]
        );
        return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
        console.error('Error fetching ticket by ticket_id:', error);
        throw error;
    }
}

// Helper function to count tickets for an event
async function countTicketsByEventId(event_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TICKETS,
            [Query.equal('event_id', event_id)]
        );
        return response.total;
    } catch (error) {
        console.error('Error counting tickets:', error);
        throw error;
    }
}

// Helper function to get all tickets for an event
async function getTicketsByEventId(event_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TICKETS,
            [Query.equal('event_id', event_id)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
}

// Helper function to get user by stud_id
async function getUserByStudId(stud_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS,
            [Query.equal('stud_id', stud_id)]
        );
        return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
        console.error('Error fetching user by stud_id:', error);
        return null; // Return null if user not found or collection doesn't exist
    }
}

// Helper function to get attended tickets (present = true)
async function getAttendedTickets(event_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TICKETS,
            [
                Query.equal('event_id', event_id),
                Query.equal('present', true)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching attended tickets:', error);
        throw error;
    }
}

// Helper function to update ticket present status
async function markTicketAsUsed(documentId) {
    try {
        const response = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.TICKETS,
            documentId,
            { present: true }
        );
        return response;
    } catch (error) {
        console.error('Error updating ticket:', error);
        throw error;
    }
}

// Helper function to get coordinators by event_id
async function getCoordinatorsByEventId(event_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COORDINATORS,
            [Query.equal('event_id', event_id)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching coordinators:', error);
        return []; // Return empty array if collection doesn't exist yet
    }
}

// Helper function to get events by coordinator name (search coordinator[] array)
async function getEventsByCoordinator(coordinatorName) {
    try {
        // Query events where coordinator[] array contains the coordinator name
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.EVENTS,
            [Query.search('coordinator', coordinatorName)] // Search in coordinator array
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching events by coordinator:', error);
        // Fallback: get all events and filter client-side (less efficient)
        try {
            const allEvents = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.EVENTS,
                []
            );
            return allEvents.documents.filter(event => 
                event.coordinator && 
                Array.isArray(event.coordinator) && 
                event.coordinator.includes(coordinatorName)
            );
        } catch (fallbackError) {
            console.error('Fallback query failed:', fallbackError);
            return [];
        }
    }
}

module.exports = {
    databases,
    DATABASE_ID,
    COLLECTIONS,
    getEventByEventId,
    getTicketByIds,
    getTicketByTicketId,
    getUserByStudId,
    countTicketsByEventId,
    getTicketsByEventId,
    getAttendedTickets,
    markTicketAsUsed,
    getCoordinatorsByEventId,
    getEventsByCoordinator
};

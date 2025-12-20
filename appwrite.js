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
    TICKETS: process.env.APPWRITE_COLLECTION_TICKETS || 'tickets'
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

// Helper function to get attended tickets (usage = true)
async function getAttendedTickets(event_id) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TICKETS,
            [
                Query.equal('event_id', event_id),
                Query.equal('usage', true)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching attended tickets:', error);
        throw error;
    }
}

// Helper function to update ticket usage
async function markTicketAsUsed(documentId) {
    try {
        const response = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.TICKETS,
            documentId,
            { usage: true }
        );
        return response;
    } catch (error) {
        console.error('Error updating ticket:', error);
        throw error;
    }
}

module.exports = {
    databases,
    DATABASE_ID,
    COLLECTIONS,
    getEventByEventId,
    getTicketByIds,
    countTicketsByEventId,
    getTicketsByEventId,
    getAttendedTickets,
    markTicketAsUsed
};

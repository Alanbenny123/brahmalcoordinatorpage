'use server';

/**
 * DATA FETCHER - SMART FALLBACK FOR COORDINATOR
 * ==============================================
 * 
 * READ STRATEGY:
 * 1. Try Firebase first (faster for mobile, better offline)
 * 2. If Firebase unavailable/stale → Fallback to Appwrite
 * 3. Return data + source indicator
 * 
 * WRITE STRATEGY:
 * → Always write to Appwrite (source of truth)
 * → Firebase sync happens via admin timer
 */

import { getBackendDB } from '@/lib/appwrite/backend';
import { Query } from 'node-appwrite';
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy as firestoreOrderBy,
} from 'firebase/firestore';

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const EVENTS_COLLECTION = process.env.APPWRITE_EVENTS_COLLECTION_ID!;
const TICKETS_COLLECTION = process.env.APPWRITE_TICKETS_COLLECTION_ID!;
const ATTENDANCE_COLLECTION = process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!;
const USERS_COLLECTION = process.env.APPWRITE_USERS_COLLECTION_ID!;

type DataSource = 'firebase' | 'appwrite' | 'error';

// Helper to check if Firebase is available
async function checkFirebaseAvailable(): Promise<boolean> {
    try {
        const testRef = collection(db, 'events');
        const snapshot = await getDocs(query(testRef, firestoreOrderBy('$createdAt', 'desc')));
        return true;
    } catch (error) {
        console.warn('Firebase not available:', error);
        return false;
    }
}

// Fetch Event by ID with smart fallback
export async function fetchEvent(eventId: string) {
    try {
        // Try Firebase first (faster for mobile)
        const isFirebaseAvailable = await checkFirebaseAvailable();
        
        if (isFirebaseAvailable) {
            try {
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);
                
                if (eventSnap.exists()) {
                    const data = eventSnap.data();
                    return {
                        event: {
                            $id: eventSnap.id,
                            ...data,
                        },
                        source: 'firebase' as DataSource,
                        success: true,
                    };
                }
            } catch (fbError) {
                console.warn('Firebase fetch failed, falling back to Appwrite:', fbError);
            }
        }
        
        // Fallback to Appwrite
        const eventDoc = await getBackendDB().getDocument(DB_ID, EVENTS_COLLECTION, eventId);
        
        return {
            event: eventDoc,
            source: 'appwrite' as DataSource,
            success: true,
        };
    } catch (error) {
        console.error('Error fetching event:', error);
        return {
            event: null,
            source: 'error' as DataSource,
            success: false,
            error: 'Failed to fetch event from both sources',
        };
    }
}

// Fetch Tickets for an Event with smart fallback
export async function fetchTicketsForEvent(eventId: string) {
    try {
        const isFirebaseAvailable = await checkFirebaseAvailable();
        
        if (isFirebaseAvailable) {
            try {
                const ticketsRef = collection(db, 'tickets');
                const q = query(ticketsRef, where('event_id', '==', eventId));
                const snapshot = await getDocs(q);
                
                const tickets = snapshot.docs.map(doc => ({
                    $id: doc.id,
                    ...doc.data()
                }));
                
                // Only return Firebase results if we found tickets
                if (tickets.length > 0) {
                    return {
                        tickets,
                        total: tickets.length,
                        source: 'firebase' as DataSource,
                        success: true,
                    };
                }
                // If Firebase returned 0 tickets, fall through to Appwrite
                console.log('Firebase returned 0 tickets, trying Appwrite...');
            } catch (fbError) {
                console.warn('Firebase tickets fetch failed, falling back to Appwrite:', fbError);
            }
        }
        
        // Fallback to Appwrite
        const ticketsRes = await getBackendDB().listDocuments(
            DB_ID,
            TICKETS_COLLECTION,
            [Query.equal('event_id', eventId)]
        );
        
        return {
            tickets: ticketsRes.documents,
            total: ticketsRes.total,
            source: 'appwrite' as DataSource,
            success: true,
        };
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return {
            tickets: [],
            total: 0,
            source: 'error' as DataSource,
            success: false,
            error: 'Failed to fetch tickets',
        };
    }
}

// Fetch Ticket by ID with smart fallback (for scanning)
export async function fetchTicket(ticketId: string) {
    try {
        const isFirebaseAvailable = await checkFirebaseAvailable();
        
        if (isFirebaseAvailable) {
            try {
                const ticketRef = doc(db, 'tickets', ticketId);
                const ticketSnap = await getDoc(ticketRef);
                
                if (ticketSnap.exists()) {
                    const data = ticketSnap.data();
                    return {
                        ticket: {
                            $id: ticketSnap.id,
                            ...data,
                        },
                        source: 'firebase' as DataSource,
                        success: true,
                    };
                }
            } catch (fbError) {
                console.warn('Firebase ticket fetch failed, falling back to Appwrite:', fbError);
            }
        }
        
        // Fallback to Appwrite
        const ticketDoc = await getBackendDB().getDocument(DB_ID, TICKETS_COLLECTION, ticketId);
        
        return {
            ticket: ticketDoc,
            source: 'appwrite' as DataSource,
            success: true,
        };
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return {
            ticket: null,
            source: 'error' as DataSource,
            success: false,
            error: 'Ticket not found',
        };
    }
}

// Fetch Attendance for an Event with smart fallback
export async function fetchAttendanceForEvent(eventId: string) {
    try {
        const isFirebaseAvailable = await checkFirebaseAvailable();
        
        if (isFirebaseAvailable) {
            try {
                const attendanceRef = collection(db, 'attendence'); // Note: typo matches Appwrite
                const q = query(attendanceRef, where('event_id', '==', eventId));
                const snapshot = await getDocs(q);
                
                const attendance = snapshot.docs.map(doc => ({
                    $id: doc.id,
                    ...doc.data()
                }));
                
                return {
                    attendance,
                    total: attendance.length,
                    source: 'firebase' as DataSource,
                    success: true,
                };
            } catch (fbError) {
                console.warn('Firebase attendance fetch failed, falling back to Appwrite:', fbError);
            }
        }
        
        // Fallback to Appwrite
        const attendanceRes = await getBackendDB().listDocuments(
            DB_ID,
            ATTENDANCE_COLLECTION,
            [Query.equal('event_id', eventId)]
        );
        
        return {
            attendance: attendanceRes.documents,
            total: attendanceRes.total,
            source: 'appwrite' as DataSource,
            success: true,
        };
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return {
            attendance: [],
            total: 0,
            source: 'error' as DataSource,
            success: false,
            error: 'Failed to fetch attendance',
        };
    }
}

// Fetch Users (for participant names)
export async function fetchUsers(userIds: string[]) {
    try {
        const isFirebaseAvailable = await checkFirebaseAvailable();
        
        if (isFirebaseAvailable && userIds.length > 0) {
            try {
                const usersRef = collection(db, 'users');
                const snapshot = await getDocs(usersRef);
                
                const users = snapshot.docs
                    .filter(doc => userIds.includes(doc.id))
                    .map(doc => ({
                        $id: doc.id,
                        ...doc.data()
                    }));
                
                return {
                    users,
                    source: 'firebase' as DataSource,
                    success: true,
                };
            } catch (fbError) {
                console.warn('Firebase users fetch failed, falling back to Appwrite:', fbError);
            }
        }
        
        // Fallback to Appwrite
        if (userIds.length === 0) {
            return { users: [], source: 'appwrite' as DataSource, success: true };
        }
        
        const usersRes = await getBackendDB().listDocuments(
            DB_ID,
            USERS_COLLECTION,
            [Query.equal('$id', userIds)]
        );
        
        return {
            users: usersRes.documents,
            source: 'appwrite' as DataSource,
            success: true,
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            users: [],
            source: 'error' as DataSource,
            success: false,
            error: 'Failed to fetch users',
        };
    }
}

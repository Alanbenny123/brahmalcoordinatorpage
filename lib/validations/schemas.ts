import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const ProfileUpdateSchema = z.object({
    id: z.string().min(1, "User ID is required"),
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const GenerateTicketSchema = z.object({
    event_id: z.string().min(1, "Event ID is required"),
    stud_ids: z.array(z.string()).min(1, "At least one student ID is required"),
    team_name: z.string().optional(),
});

export const ScanTicketSchema = z.object({
    ticket_id: z.string().min(1, "Ticket ID is required"),
    event_id: z.string().min(1, "Event ID is required"),
});

export const MarkAttendanceSchema = z.object({
    ticket_id: z.string().min(1, "Ticket ID is required"),
    stud_id: z.string().min(1, "Student ID is required"),
    event_id: z.string().min(1, "Event ID is required"),
});

export const CloseTicketSchema = z.object({
    event_id: z.string().min(1, "Event ID is required"),
});

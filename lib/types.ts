import type { Models } from "appwrite";

export interface BaseDoc {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}


export interface Student extends Models.Document {
  name: string;
  email: string;
  pass: string;
  certificates: string[];
  tickets: string[];
}

export interface StudentUpdate {
  name?: string;
  email?: string;
  pass?: string;          // hashed password will be stored here
}


export interface StudentPublic {
  id: string;
  name: string;
  email: string;
  certificates?: string[];
  tickets?: string[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: StudentPublic;
  token?: string;
  message?: string;
  error?: string;
}


export interface EventDocument {
  $id: string;
  event_name: string;
  category: string;
  venue: string;
  date: string;
  brahma_poster?: string;  
  completed: boolean;
  amount: number;
}

export interface FetchResponse {
  data: EventDocument[];
  total: number;
  totalPages: number;
}

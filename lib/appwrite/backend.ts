import { Client, Databases, Users } from "node-appwrite";

let backend: Client | null = null;
let backendDBInstance: Databases | null = null;
let backendUsersInstance: Users | null = null;

function getBackendClient(): Client {
  if (!backend) {
    const endpoint = process.env.APPWRITE_BACKEND_ENDPOINT;
    const projectId = process.env.APPWRITE_BACKEND_PROJECT_ID;
    const apiKey = process.env.APPWRITE_BACKEND_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
      throw new Error("Appwrite backend environment variables are not configured");
    }

    backend = new Client();
    backend.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  }
  return backend;
}

export function getBackendDB(): Databases {
  if (!backendDBInstance) {
    backendDBInstance = new Databases(getBackendClient());
  }
  return backendDBInstance;
}

export function getBackendUsers(): Users {
  if (!backendUsersInstance) {
    backendUsersInstance = new Users(getBackendClient());
  }
  return backendUsersInstance;
}

// Legacy exports for backward compatibility - use getters instead
export const backendDB = { get: getBackendDB };
export const backendUsers = { get: getBackendUsers };

export default { getClient: getBackendClient };

import { Client, Databases, Users } from "node-appwrite";

const backend = new Client();

backend
  .setEndpoint(process.env.APPWRITE_BACKEND_ENDPOINT!)
  .setProject(process.env.APPWRITE_BACKEND_PROJECT_ID!)
  .setKey(process.env.APPWRITE_BACKEND_API_KEY!);

export const backendDB = new Databases(backend);
export const backendUsers = new Users(backend);

export default backend;

import axios from "axios";
import { IdentityService } from "./identity-service";

const isDev = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: !isDev
});

if (api.defaults.baseURL) console.info(`Setting up API with server URL: ${api.defaults.baseURL}`);
else console.warn("No server URL found in environment variables");

const identityService = new IdentityService(api);

export { identityService };
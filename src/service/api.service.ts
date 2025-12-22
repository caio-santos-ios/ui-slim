import axios from "axios";

// export const uriBase = 'http://localhost:5103'
export const uriBase = 'http://72.62.11.203:3001'
export const baseURL = `${uriBase}/api`;

export const api = axios.create({
  baseURL
});

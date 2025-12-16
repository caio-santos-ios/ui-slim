import axios from "axios";


export const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  // baseURL: 'http://localhost:5103/api',
  baseURL: 'http://72.62.11.203:3001/api',
});

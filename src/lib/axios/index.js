import axios from "axios";

export const httpApi = axios.create({ baseURL: import.meta.env.VITE_API_URL });
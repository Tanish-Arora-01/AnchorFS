// api.ts
import axios from 'axios';
import { supabase } from './AuthContext';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

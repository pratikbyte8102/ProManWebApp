import { client } from './client';
import type { AuthResponse, User } from '../types';

export const login = (email: string, password: string) =>
  client.post<AuthResponse>('/api/auth/login', { email, password }).then(r => r.data);

export const register = (email: string, password: string, displayName: string) =>
  client.post<AuthResponse>('/api/auth/register', { email, password, displayName }).then(r => r.data);

export const getMe = () => client.get<User>('/api/auth/me').then(r => r.data);

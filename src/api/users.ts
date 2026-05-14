import { client } from './client';
import type { User } from '../types';

export const getUsers = () => client.get<User[]>('/api/users').then(r => r.data);

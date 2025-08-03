import type { Category } from './Category';

export interface Avatar {
  id: number;
  name: string;
  url: string;
}

export interface Role {
  id: number;
  name: string;
  type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: Avatar | null;
  role?: Role;
  categories?: Category[];
}
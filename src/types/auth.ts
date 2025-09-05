export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  name: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const DUMMY_USERS: User[] = [
  {
    id: '1',
    username: 'user',
    email: 'user@telnet.co.id',
    role: 'user',
    name: 'Staff User',
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@telnet.co.id',
    role: 'admin',
    name: 'Admin Telnet',
  },
  {
    id: '3',
    username: 'superadmin',
    email: 'superadmin@telnet.co.id',
    role: 'super_admin',
    name: 'Super Admin',
  },
];

export const DUMMY_CREDENTIALS = [
  { username: 'user', password: 'user123' },
  { username: 'admin', password: 'admin123' },
  { username: 'superadmin', password: 'super123' },
];
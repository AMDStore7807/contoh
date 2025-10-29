export interface User {
  userId: string;
  username: string;
  roles?: string;
}

export interface Permission {
  _id: string;
  role: string;
  resource: string;
  access: number;
  validate: boolean;
  filter?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasAccess: (resource: string, requiredAccess: number) => boolean;
}

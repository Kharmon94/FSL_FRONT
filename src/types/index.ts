export interface User {
  id: number;
  email: string;
  admin: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error?: string;
  errors?: string[];
  message?: string;
}

export function canViewAdmin(user: User | null): boolean {
  return !!user?.admin;
}

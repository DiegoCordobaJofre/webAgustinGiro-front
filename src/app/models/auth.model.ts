export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
}









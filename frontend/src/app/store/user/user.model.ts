export interface User {
  id?: string;
  email?: string
}

export interface UserState {
  id?: string;
  email?: string;
  authError?: string;
  loading: boolean;
  userDataFetched: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

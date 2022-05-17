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

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface ResetPasswordRequest {
  password: string;
  passwordConfirm: string;
}

export interface ChangeEmailRequest {
  email: string;
  password: string;
}

export interface ResponseResult {
  success: boolean;
  message: string;
}

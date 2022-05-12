import {createAction, props} from '@ngrx/store';
import {LoginRequest, User} from './user.model';

export const loginStart = createAction(
  "[Login Form] User Login",
  props<{request: LoginRequest}>()
);

export const logoutStart = createAction(
  "[Navigation Bar] User Logout"
);

export const logoutSuccess = createAction(
  "[logout effect] User Logout success"
);

export const logoutFailed = createAction(
  "[logout effect] User Logout failed"
);

export const signupStart = createAction(
  "[Signup Form] User Signup",
  props<{request: LoginRequest}>()
);

export const signupSuccess = createAction(
  "[Signup effect] User Signup success",
  props<{user: User}>()
);

export const signupFailed = createAction(
  "[signup effect] User Signup failed",
  props<{message: string}>()
);

export const loginSuccess = createAction(
  "[login effect] User Login success",
  props<{user: User}>()
);

export const loginFailed = createAction(
  "[login effect] User Login failed",
  props<{message: string}>()
);

export const fetchUserStart = createAction(
  "[App component] User Fetch start"
);

export const userFetchFinished = createAction(
  "[userFetch effect] User Fetch finished",
  props<{user?: User}>()
);

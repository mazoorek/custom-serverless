import {createAction, props} from '@ngrx/store';
import {LoginRequest, User} from './user.model';

export const loginStart = createAction(
  "[Login Form] User Login",
  props<{request: LoginRequest}>()
);

export const loginSuccess = createAction(
  "[login effect] User Login success",
  props<{user: User}>()
);

export const loginFailed = createAction(
  "[login effect] User Login failed",
  props<{message: string}>()
);

export const logout = createAction(
  "[Navigation Bar] User Logout"
);

export const fetchUserStart = createAction(
  "[App component] User Fetch start"
);

export const userFetchFinished = createAction(
  "[userFetch effect] User Fetch finished",
  props<{user?: User}>()
);

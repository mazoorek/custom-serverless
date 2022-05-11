import {createAction, props} from '@ngrx/store';
import {User} from './user.model';

export const login = createAction(
  "[Login Form] User Login",
  props<{user: User}>()
);

export const logout = createAction(
  "[Navigation Bar] User Logout"
);

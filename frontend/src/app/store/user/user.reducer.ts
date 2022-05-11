import {Action, createReducer, on} from '@ngrx/store';
import {UserActions} from './index';
import {UserState} from './user.model';


export const initialState: UserState = {
  id: undefined,
  email: undefined
}

export const userReducer = createReducer<UserState, Action>(
  initialState,
  on(UserActions.login, (state: UserState, action) => {
    return {
      ...state,
      ...action.user
    }
  }),
  on(UserActions.logout, (state: UserState, action) => {
    return initialState
  })
);

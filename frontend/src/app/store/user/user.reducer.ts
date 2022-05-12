import {Action, createReducer, on} from '@ngrx/store';
import {UserActions} from './index';
import {UserState} from './user.model';


export const initialState: UserState = {
  id: undefined,
  email: undefined,
  loading: false,
  userDataFetched: false
}

export const userReducer = createReducer<UserState, Action>(
  initialState,
  on(UserActions.loginSuccess, (state: UserState, action) => {
    return {
      ...state,
      ...action.user,
      loading: false
    }
  }),
  on(UserActions.userFetchFinished, (state: UserState, action) => {
    return {
      ...state,
      ...action.user,
      loading: false,
      userDataFetched: true
    }
  }),
  on(UserActions.logout, (state: UserState, action) => {

    return {
      ...state,
      ...initialState
    }
  }),
  on(UserActions.loginStart, (state: UserState, action) => {
    return {
      ...state,
      authError: undefined,
      loading: true
    }
  }),
  on(UserActions.loginFailed, (state: UserState, action) => {
    return {
      ...state,
      authError: action.message,
      id: undefined,
      email: undefined,
      loading: false
    }
  })
);

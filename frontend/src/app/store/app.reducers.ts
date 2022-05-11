import {ActionReducerMap} from '@ngrx/store';
import {UserState} from './user/user.model';
import {applicationsReducer, ApplicationsState} from './applications/applications.reducer';
import {userReducer} from './user/user.reducer';

export interface AppState {
  user: UserState,
  applications: ApplicationsState
}

export const reducers: ActionReducerMap<AppState> = {
  user: userReducer,
  applications: applicationsReducer
}

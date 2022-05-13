import {ActionReducerMap} from '@ngrx/store';
import {UserState} from './user/user.model';
import {userReducer} from './user/user.reducer';
import {ApplicationsState} from './applications/applications.model';
import {applicationsReducer} from './applications/applications.reducer';

export interface AppState {
  user: UserState,
  applications: ApplicationsState
}

export const reducers: ActionReducerMap<AppState> = {
  user: userReducer,
  applications: applicationsReducer
}

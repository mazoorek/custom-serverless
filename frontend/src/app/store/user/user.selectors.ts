import {createSelector} from '@ngrx/store';
import {AppState} from '../app.reducers';

export const isLoggedIn = createSelector(
  (state: AppState) => state.user,
  user => !!user.id
);

export const isLoggedOut = createSelector(
  isLoggedIn,
  (loggedIn: boolean) => !loggedIn
)

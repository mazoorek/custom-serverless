import {createSelector} from '@ngrx/store';
import {AppState} from '../app.reducers';

export const isLoggedIn = createSelector(
  (state: AppState) => state.user,
  user => !!user.id
);

export const selectUserEmail = createSelector(
  (state: AppState) => state.user,
  user => user.email
);

export const userDataFetched = createSelector(
  (state: AppState) => state.user,
  user => user.userDataFetched
);

export const isLoggedOut = createSelector(
  isLoggedIn,
  (loggedIn: boolean) => !loggedIn
);

export const isLoading = createSelector(
  (state: AppState) => state.user,
  user => user.loading
);

export const authError = createSelector(
  (state: AppState) => state.user,
  user => user.authError
);

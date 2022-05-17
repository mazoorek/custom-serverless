import {createSelector} from '@ngrx/store';
import {AppState} from '../app.reducers';

export const isLoggedIn = createSelector(
  (state: AppState) => state.user,
  user => !!user.id
);

export const userDataFetched = createSelector(
  (state: AppState) => state.user,
  user => user.userDataFetched
);

export const isLoggedOut = createSelector(
  isLoggedIn,
  (loggedIn: boolean) => !loggedIn
);

// TODO loading and error handling

export const isLoading = createSelector(
  (state: AppState) => state.user,
  user => user.loading
);

export const authError = createSelector(
  (state: AppState) => state.user,
  user => user.authError
);

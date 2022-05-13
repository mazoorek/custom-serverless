import {createSelector} from '@ngrx/store';
import {AppState} from '../app.reducers';
import {applicationsSelectors} from './applications.reducer';

export const selectApplications = createSelector(
  (state: AppState) => state.applications,
  applicationsSelectors.selectAll
);

export const applicationsLoaded = createSelector(
  (state: AppState) => state.applications,
   applications => applications.loaded
);

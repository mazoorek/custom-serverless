import {createSelector} from '@ngrx/store';
import {AppState} from '../app.reducers';
import {applicationsSelectors} from './applications.reducer';

export const selectApplications = createSelector(
  (state: AppState) => state.applications,
  applicationsSelectors.selectAll
);

export const areApplicationsLoaded = createSelector(
  (state: AppState) => state.applications,
   applications => applications.loaded
);

export const selectApplication = createSelector(
  (state: AppState) => state.applications,
  applications => applications.selectedApplication
);

export const selectApplicationName = createSelector(
  selectApplication,
  selectedApplication => selectedApplication?.name
);

export const selectEndpoint = createSelector(
  (state: AppState) => state.applications,
  applications => applications.selectedEndpoint
);

export const selectFunction = createSelector(
  (state: AppState) => state.applications,
  applications => applications.selectedFunction
);

import {createAction, props} from '@ngrx/store';
import {Application} from './applications.model';

export const loadApplications = createAction(
  "[Applications Resolver] Load All Applications",
);

export const loadApplicationsSuccess = createAction(
  "[loadApplications effect] Loaded All Applications",
  props<{ applications: Application [] }>()
);

export const loadApplicationsFailed = createAction(
  "[loadApplications effect] Load All Applications failed"
);

export const loadApplication = createAction(
  "[Application Resolver] Load Application",
);

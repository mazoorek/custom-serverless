import {createAction, props} from '@ngrx/store';
import {Application, DependenciesResponse} from './applications.model';
import {Update} from '@ngrx/entity';

export const loadApplications = createAction(
  "[Applications Resolver] Load All Applications",
);

export const reloadApplications = createAction(
  "[reloadApplication effect] Reload Applications",
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
  props<{ appName: string }>()
);

export const startApplication = createAction(
  "[Application View] Start Application",
  props<{ appName: string }>()
);

export const moveToApplication = createAction(
  "[Application View] Move To Application",
  props<{ appName: string }>()
);

export const moveToApplicationSuccess = createAction(
  "[moveToApplication effect] Move To Application Success",
  props<{ application: Application }>()
);

export const moveToApplicationFailed = createAction(
  "[moveToApplication effect] Move To Application Failed",
  props<{ message: string }>()
);

export const startApplicationSuccess = createAction(
  "[Application View] Start Application Success",
  props<{ application: Update<Application> }>()
);

export const startApplicationFailed = createAction(
  "[Application View] Start Application Failed",
  props<{ message: string }>()
);

export const stopApplication = createAction(
  "[Application View] Stop Application",
  props<{ appName: string }>()
);

export const stopApplicationSuccess = createAction(
  "[Application View] Stop Application Success",
  props<{ application: Update<Application> }>()
);

export const stopApplicationFailed = createAction(
  "[Application View] Stop Application Failed",
  props<{ message: string }>()
);

export const deleteApplication = createAction(
  "[Application View] Delete Application",
  props<{ appName: string }>()
);

export const deleteApplicationSuccess = createAction(
  "[deleteApplication effect] Delete Application Success",
  props<{ appName: string }>()
);

export const deleteApplicationFailed = createAction(
  "[deleteApplication effect] Delete Application Failed",
  props<{ message: string }>()
);

export const loadApplicationSuccess = createAction(
  "[loadApplication effect] Load Application Success",
  props<{ application: Application }>()
);

export const loadApplicationFailed = createAction(
  "[loadApplication effect] Load Application Failed",
  props<{ message: string }>()
);

export const createApplication = createAction(
  "[Applications View] Create Application",
  props<{ appName: string }>()
);

export const loadNewApplication = createAction(
  "[createApplication effect] Load New Application",
  props<{ appName: string }>()
);

export const loadNewApplicationSuccess = createAction(
  "[loadNewApplication effect] Load New Application Success",
  props<{ application: Application }>()
);

export const loadNewApplicationFailed = createAction(
  "[loadNewApplication effect] Load New Application Failed",
  props<{ message: string }>()
);

export const createApplicationFailed = createAction(
  "[createApplication effect] Create Application Failed",
  props<{ message: string }>()
);

export const stopSelectedApplication = createAction(
  "[Overview View] Stop Application",
  props<{ appName: string }>()
);

export const stopSelectedApplicationSuccess = createAction(
  "[stopSelectedApplication effect] Stop Application Success",
  props<{ application: Update<Application> }>()
);

export const stopSelectedApplicationFailed = createAction(
  "[stopSelectedApplication effect] Stop Application Failed",
  props<{ message: string }>()
);

export const startSelectedApplication = createAction(
  "[Overview View] Start Application",
  props<{ appName: string }>()
);

export const startSelectedApplicationSuccess = createAction(
  "[startSelectedApplication effect] Start Application Success",
  props<{ application: Update<Application> }>()
);

export const startSelectedApplicationFailed = createAction(
  "[startSelectedApplication effect] Start Application Failed",
  props<{ message: string }>()
);

export const editSelectedApplicationName = createAction(
  "[Overview View] Edit Application name",
  props<{ oldAppName: string, appName: string }>()
);

export const editSelectedApplicationNameSuccess = createAction(
  "[editSelectedApplicationName effect] Edit Application name Success",
  props<{ application: Update<Application> }>()
);

export const editSelectedApplicationNameFailed = createAction(
  "[editSelectedApplicationName effect] Edit Application name Failed",
  props<{ message: string }>()
);

export const deleteSelectedApplication = createAction(
  "[Overview View] Delete Application",
  props<{ appName: string }>()
);

export const deleteSelectedApplicationSuccess = createAction(
  "[deleteSelectedApplication effect] Delete Application Success",
  props<{ appName: string }>()
);

export const deleteSelectedApplicationFailed = createAction(
  "[deleteSelectedApplication effect] Delete Application Failed",
  props<{ message: string }>()
);

export const saveDependencies = createAction(
  "[Dependencies View] Save Dependencies",
  props<{ appName: string, packageJson: string}>()
);

export const saveDependenciesSuccessResponse = createAction(
  "[saveDependencies effect] Save Dependencies Success Response",
  props<{ validationResult: DependenciesResponse }>()
);

export const saveDependenciesFailedResponse = createAction(
  "[saveDependencies effect] Save Dependencies Failed Response",
  props<{ validationResult: DependenciesResponse }>()
);

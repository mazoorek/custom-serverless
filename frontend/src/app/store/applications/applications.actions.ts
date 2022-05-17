import {createAction, props} from '@ngrx/store';
import {Application, DependenciesResponse, Endpoint, Function} from './applications.model';
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
  props<{ appName: string, packageJson: string }>()
);

export const saveDependenciesSuccessResponse = createAction(
  "[saveDependencies effect] Save Dependencies Success Response",
  props<{ validationResult: DependenciesResponse }>()
);

export const saveDependenciesFailedResponse = createAction(
  "[saveDependencies effect] Save Dependencies Failed Response",
  props<{ validationResult: DependenciesResponse }>()
);

export const loadEndpoint = createAction(
  "[Endpoint Resolver] Load Endpoint",
  props<{ appName: string, endpointUrl: string }>()
);

export const loadEndpointSuccess = createAction(
  "[loadEndpoint effect] Load Endpoint Success",
  props<{ endpoint: Endpoint }>()
);

export const loadEndpointFailed = createAction(
  "[loadEndpoint effect] Load Endpoint Failed",
  props<{ message: string }>()
);

export const deleteEndpoint = createAction(
  "[Endpoints View] Delete Endpoint",
  props<{ appName: string, endpointUrl: string }>()
);

export const deleteEndpointSuccess = createAction(
  "[deleteEndpoint effect] Delete Endpoint Success",
  props<{ endpointUrl: string }>()
);

export const deleteEndpointFailed = createAction(
  "[deleteEndpoint effect] Delete Endpoint Failed",
  props<{ message: string }>()
);

export const moveToEndpoint = createAction(
  "[Endpoints View] Move To Endpoint",
  props<{ appName: string, endpointUrl: string }>()
);

export const moveToEndpointSuccess = createAction(
  "[moveToEndpoint effect] Move To Endpoint Success",
  props<{ endpoint: Endpoint }>()
);

export const moveToEndpointFailed = createAction(
  "[moveToEndpoint effect] Move To Endpoint Failed",
  props<{ message: string }>()
);

export const createEndpoint = createAction(
  "[Endpoints View] Create Endpoint",
  props<{ appName: string, endpoint: Endpoint }>()
);

export const loadNewEndpoint = createAction(
  "[createEndpoint effect] Load New Endpoint",
  props<{ endpoint: Endpoint }>()
);

export const createEndpointFailed = createAction(
  "[createEndpoint effect] Create Endpoint Failed",
  props<{ message: string }>()
);

export const updateEndpoint = createAction(
  "[Endpoint Edit View] Update Endpoint",
  props<{ appName: string, endpointUrl: string, endpoint: Endpoint }>()
);

export const updateEndpointSuccess = createAction(
  "[updateEndpoint effect] Update Endpoint Success",
  props<{ oldEndpointUrl: string, endpoint: Endpoint }>()
);

export const updateEndpointFailed = createAction(
  "[updateEndpoint effect] Update Endpoint Failed",
  props<{ message: string }>()
);

export const loadFunction = createAction(
  "[Function Resolver] Load Function",
  props<{ appName: string, functionName: string }>()
);

export const loadFunctionSuccess = createAction(
  "[loadFunction effect] Load Function Success",
  props<{ function: Function }>()
);

export const loadFunctionFailed = createAction(
  "[loadFunction effect] Load Function Failed",
  props<{ message: string }>()
);

export const moveToFunction = createAction(
  "[Functions View] Move To Function",
  props<{ appName: string, functionName: string }>()
);

export const moveToFunctionSuccess = createAction(
  "[moveToFunction effect] Move To Function Success",
  props<{ function: Function }>()
);

export const moveToFunctionFailed = createAction(
  "[moveToFunction effect] Move To Function Failed",
  props<{ message: string }>()
);

export const createFunction = createAction(
  "[Functions View] Create Function",
  props<{ appName: string, functionName: string }>()
);

export const loadNewFunction = createAction(
  "[createFunction effect] Load New Function",
  props<{ appName: string, functionName: string }>()
);

export const createFunctionFailed = createAction(
  "[createFunction effect] Create Function Failed",
  props<{ message: string }>()
);

export const loadNewFunctionSuccess = createAction(
  "[loadNewFunction effect] Load New Function Success",
  props<{ function: Function }>()
);

export const loadNewFunctionFailed = createAction(
  "[loadNewFunction effect] Load New Function Failed",
  props<{ message: string }>()
);


export const deleteFunction = createAction(
  "[Functions View] Delete Function",
  props<{ appName: string, functionName: string }>()
);

export const deleteFunctionSuccess = createAction(
  "[deleteFunction effect] Delete Function Success",
  props<{ functionName: string }>()
);

export const deleteFunctionFailed = createAction(
  "[deleteFunction effect] Delete Function Failed",
  props<{ message: string }>()
);

export const updateFunction = createAction(
  "[Function Edit View] Update Function",
  props<{ appName: string, functionName: string, function: Function }>()
);

export const updateFunctionSuccess = createAction(
  "[updateFunction effect] Update Function Success",
  props<{ oldFunctionName: string, function: Function }>()
);

export const updateFunctionFailed = createAction(
  "[updateFunction effect] Update Function Failed",
  props<{ message: string }>()
);

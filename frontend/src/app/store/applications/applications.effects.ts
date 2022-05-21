import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApplicationsActions} from './index';
import {catchError, map, of, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../app.reducers';
import {Router} from '@angular/router';
import {ApplicationsService} from '../../applications/applications.service';

@Injectable()
export class ApplicationsEffects {

  constructor(private action$: Actions, private store: Store<AppState>, private router: Router,
              private applicationsService: ApplicationsService) {
  }

  loadApplications$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.loadApplications, ApplicationsActions.reloadApplications),
      switchMap((action) =>
        this.applicationsService.loadApplications()
          .pipe(
            map(applications => ApplicationsActions.loadApplicationsSuccess({applications})),
            catchError(error => of(ApplicationsActions.loadApplicationsFailed())
            ),
          )
      )
    )
  );

  createApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.createApplication),
      switchMap((action) =>
        this.applicationsService.createApplication(action.appName)
          .pipe(
            map(() => ApplicationsActions.loadNewApplication({appName: action.appName})),
            tap(() => this.router.navigate(['applications', action.appName, 'overview'])),
            catchError(error => of(ApplicationsActions.createApplicationFailed({
                message: error?.error?.message ? error.error.message : 'failed to create application'
            }))
            ),
          )
      )
    )
  );

  loadNewApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.loadNewApplication),
      switchMap((action) =>
        this.applicationsService.loadApplication(action.appName)
          .pipe(
            map((application) => ApplicationsActions.loadNewApplicationSuccess({application})),
            tap(() => this.router.navigate(['applications', action.appName, 'overview'])),
            catchError(error => of(ApplicationsActions.loadNewApplicationFailed({message: 'failed to create application'}))
            ),
          )
      )
    )
  );

  loadApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.loadApplication),
      switchMap((action) =>
        this.applicationsService.loadApplication(action.appName)
          .pipe(
            map((application) => ApplicationsActions.loadApplicationSuccess({application})),
            catchError(error => of(ApplicationsActions.loadApplicationFailed({message: 'failed to create application'}))
            ),
          )
      )
    )
  );

  moveToApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.moveToApplication),
      switchMap((action) =>
        this.applicationsService.loadApplication(action.appName)
          .pipe(
            map((application) => ApplicationsActions.moveToApplicationSuccess({application})),
            tap(() => this.router.navigate(['applications', action.appName, 'overview'])),
            catchError(error => of(ApplicationsActions.moveToApplicationFailed({message: 'failed to move to application'}))
            ),
          )
      )
    )
  );

  deleteApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.deleteApplication),
      switchMap((action) =>
        this.applicationsService.deleteApp(action.appName)
          .pipe(
            map(() => ApplicationsActions.deleteApplicationSuccess({appName: action.appName})),
            catchError(error => of(ApplicationsActions.deleteApplicationFailed({message: 'failed to delete application'}))
            ),
          )
      )
    )
  );

  stopApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.stopApplication),
      switchMap((action) =>
        this.applicationsService.stopApp(action.appName)
          .pipe(
            map(() => ApplicationsActions.stopApplicationSuccess(
                {
                  application: {
                    id: action.appName, changes: {
                      up: false
                    }
                  }
                }
              )
            ),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.stopApplicationFailed({message: 'failed to stop application'}))
            ),
          )
      )
    )
  );

  startApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.startApplication),
      switchMap((action) =>
        this.applicationsService.startApp(action.appName)
          .pipe(
            map(() => ApplicationsActions.startApplicationSuccess(
                {
                  application: {
                    id: action.appName, changes: {
                      up: true
                    }
                  }
                }
              )
            ),
            catchError(error => of(ApplicationsActions.startApplicationFailed({message: 'failed to start application'}))
            ),
          )
      )
    )
  );

  startSelectedApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.startSelectedApplication),
      switchMap((action) =>
        this.applicationsService.startApp(action.appName)
          .pipe(
            map(() => ApplicationsActions.startSelectedApplicationSuccess(
                {
                  application: {
                    id: action.appName, changes: {
                      up: true
                    }
                  }
                }
              )
            ),
            catchError(error => of(ApplicationsActions.startSelectedApplicationFailed({message: 'failed to start application'}))
            ),
          )
      )
    )
  );

  stopSelectedApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.stopSelectedApplication),
      switchMap((action) =>
        this.applicationsService.stopApp(action.appName)
          .pipe(
            map(() => ApplicationsActions.stopSelectedApplicationSuccess(
                {
                  application: {
                    id: action.appName, changes: {
                      up: false
                    }
                  }
                }
              )
            ),
            catchError(error => of(ApplicationsActions.stopSelectedApplicationFailed({message: 'failed to stop application'}))
            ),
          )
      )
    )
  );

  editSelectedApplicationName$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.editSelectedApplicationName),
      switchMap((action) =>
        this.applicationsService.editApp(action.oldAppName, action.appName)
          .pipe(
            map(() => ApplicationsActions.editSelectedApplicationNameSuccess(
                {
                  application: {
                    id: action.oldAppName, changes: {
                      name: action.appName
                    }
                  }
                }
              )
            ),
            tap(() => this.router.navigate(['applications', action.appName, 'overview'])),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.editSelectedApplicationNameFailed({
              message: error?.error?.message ? error.error.message : 'failed to edit application name'
            }))
            ),
          )
      )
    )
  );

  deleteSelectedApplication$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.deleteSelectedApplication),
      switchMap((action) =>
        this.applicationsService.deleteApp(action.appName)
          .pipe(
            map(() => ApplicationsActions.deleteSelectedApplicationSuccess({appName: action.appName})),
            tap(() => this.router.navigate(['applications'])),
            catchError(error => of(ApplicationsActions.deleteSelectedApplicationFailed({message: 'failed to delete application'}))
            ),
          )
      )
    )
  );

  saveDependencies$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.saveDependencies),
      switchMap((action) =>
        this.applicationsService.saveDependencies(action.appName, action.packageJson)
          .pipe(
            map((response) => ApplicationsActions.saveDependenciesSuccessResponse({validationResult: response, packageJson: action.packageJson})),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.saveDependenciesFailedResponse({
                validationResult: {
                  valid: false,
                  errors: ['failed to save dependencies']
                }
              }))
            ),
          )
      )
    )
  );

  loadEndpoint$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.loadEndpoint),
      switchMap((action) =>
        this.applicationsService.loadEndpoint(action.appName, action.endpointUrl)
          .pipe(
            map((endpoint) => ApplicationsActions.loadEndpointSuccess({endpoint})),
            catchError(error => of(ApplicationsActions.loadEndpointFailed({message: 'failed to load endpoint'}))
            ),
          )
      )
    )
  );

  deleteEndpoint$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.deleteEndpoint),
      switchMap((action) =>
        this.applicationsService.deleteEndpoint(action.appName, action.endpointUrl)
          .pipe(
            map(() => ApplicationsActions.deleteEndpointSuccess({endpointUrl: action.endpointUrl})),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.deleteEndpointFailed({message: 'failed to delete endpoint'}))
            ),
          )
      )
    )
  );

  moveToEndpoint$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.moveToEndpoint),
      switchMap((action) =>
        this.applicationsService.loadEndpoint(action.appName, action.endpointUrl)
          .pipe(
            map((endpoint) => ApplicationsActions.moveToEndpointSuccess({endpoint})),
            tap(() => this.router.navigate(['applications', action.appName, 'endpoints', action.endpointUrl, 'edit'])),
            catchError(error => of(ApplicationsActions.moveToEndpointFailed({message: 'failed to move to application'}))
            ),
          )
      )
    )
  );

  createEndpoint$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.createEndpoint),
      switchMap((action) =>
        this.applicationsService.createEndpoint(action.appName, action.endpoint)
          .pipe(
            map(() => ApplicationsActions.loadNewEndpoint({endpoint: action.endpoint})),
            tap(() => this.router.navigate(['applications', action.appName, 'endpoints', action.endpoint.url, 'edit'])),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.createEndpointFailed({message: 'failed to create endpoint'}))
            ),
          )
      )
    )
  );

  updateEndpoint$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.updateEndpoint),
      switchMap((action) =>
        this.applicationsService.editEndpoint(action.appName, action.endpointUrl, action.endpoint)
          .pipe(
            map(() => ApplicationsActions.updateEndpointSuccess({
              oldEndpointUrl: action.endpointUrl,
              endpoint: action.endpoint
            })),
            tap(() => {
              if(action.endpointUrl !== action.endpoint.url) {
                this.router.navigate(['applications', action.appName, 'endpoints', action.endpoint.url, 'edit'])
              }
            }),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.updateEndpointFailed({message: 'failed to update endpoint'}))
            ),
          )
      )
    )
  );

  loadFunction$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.loadFunction),
      switchMap((action) =>
        this.applicationsService.loadFunction(action.appName, action.functionName)
          .pipe(
            map((func) => ApplicationsActions.loadFunctionSuccess({function: func})),
            catchError(error => of(ApplicationsActions.loadFunctionFailed({message: 'failed to load function'}))
            ),
          )
      )
    )
  );

  moveToFunction$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.moveToFunction),
      switchMap((action) =>
        this.applicationsService.loadFunction(action.appName, action.functionName)
          .pipe(
            map((func) => ApplicationsActions.moveToFunctionSuccess({function: func})),
            tap(() => this.router.navigate(['applications', action.appName, 'functions', action.functionName, 'edit'])),
            catchError(error => of(ApplicationsActions.moveToFunctionFailed({message: 'failed to move to function'}))
            ),
          )
      )
    )
  );

  createFunction$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.createFunction),
      switchMap((action) =>
        this.applicationsService.createFunction(action.appName, action.functionName)
          .pipe(
            map(() => ApplicationsActions.loadNewFunction({appName: action.appName, functionName: action.functionName})),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.createFunctionFailed({message: 'failed to create function'}))
            ),
          )
      )
    )
  );

  loadNewFunction$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.loadNewFunction),
      switchMap((action) =>
        this.applicationsService.loadFunction(action.appName, action.functionName)
          .pipe(
            map((func) => ApplicationsActions.loadNewFunctionSuccess({function: func})),
            tap(() => this.router.navigate(['applications', action.appName, 'functions', action.functionName, 'edit'])),
            catchError(error => of(ApplicationsActions.loadNewFunctionFailed({message: 'failed to load new function'}))
            ),
          )
      )
    )
  );

  deleteFunction$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.deleteFunction),
      switchMap((action) =>
        this.applicationsService.deleteFunction(action.appName, action.functionName)
          .pipe(
            map(() => ApplicationsActions.deleteFunctionSuccess({functionName: action.functionName})),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.deleteFunctionFailed({message: 'failed to delete function'}))
            ),
          )
      )
    )
  );

  updateFunction$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.updateFunction),
      switchMap((action) =>
        this.applicationsService.editFunction(action.appName, action.functionName, action.function)
          .pipe(
            map(() => ApplicationsActions.updateFunctionSuccess({
              oldFunctionName: action.functionName,
              function: action.function
            })),
            tap(() => {
              if(action.functionName !== action.function.name) {
                this.router.navigate(['applications', action.appName, 'functions', action.function.name, 'edit'])
              }
            }),
            tap(() => this.store.dispatch(ApplicationsActions.reloadApplications())),
            catchError(error => of(ApplicationsActions.updateFunctionFailed({message: 'failed to update function'}))
            ),
          )
      )
    )
  );
}

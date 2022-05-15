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

  constructor(private action$: Actions, private store: Store<AppState>,  private router: Router,
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
            catchError(error => of(ApplicationsActions.createApplicationFailed({message: 'failed to create application'}))
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
            catchError(error => of(ApplicationsActions.startApplicationFailed({message: 'failed to stop application'}))
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
            catchError(error => of(ApplicationsActions.startSelectedApplicationFailed({message: 'failed to stop application'}))
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
            catchError(error => of(ApplicationsActions.editSelectedApplicationNameFailed({message: 'failed to edit application name'}))
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
}

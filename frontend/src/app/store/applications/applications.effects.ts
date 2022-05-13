import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApplicationsActions} from './index';
import {catchError, map, of, switchMap} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../app.reducers';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Application} from '../../applications/applications.service';

@Injectable()
export class ApplicationsEffects {

  constructor(private action$: Actions, private store: Store<AppState>, private http: HttpClient, private router: Router) {
  }

  loadApplications$ = createEffect(() =>
    this.action$.pipe(
      ofType(ApplicationsActions.loadApplications),
      switchMap((action) =>
        this.http.get<Application[]>("/api/applications")
          .pipe(
            map(applications => ApplicationsActions.loadApplicationsSuccess({applications})),
            catchError(error => of(ApplicationsActions.loadApplicationsFailed())
            ),
          )
      )
    )
  );
}

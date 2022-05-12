import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserActions} from './index';
import {catchError, map, of, shareReplay, switchMap, tap} from 'rxjs';
import {fetchUserStart, loginStart, userFetchFinished} from './user.actions';
import {Store} from '@ngrx/store';
import {AppState} from '../app.reducers';
import {User} from '../../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Injectable()
export class UserEffects {

  constructor(private action$: Actions, private store: Store<AppState>, private http: HttpClient, private router: Router) {
  }

  fetchUser$ = createEffect(() =>
    this.action$.pipe(
      ofType(UserActions.fetchUserStart),
      tap(action => console.log(action)),
      switchMap((action) => {
        return this.http.get<User>('/api/user')
          .pipe(
            map(user => UserActions.userFetchFinished({user})),
            catchError(error => of(UserActions.userFetchFinished({user: undefined})))
          )
      })
    ));

  login$ = createEffect(() =>
    this.action$.pipe(
      ofType(UserActions.loginStart),
      switchMap((action) =>
        this.http.post<User>("/api/user/login", action.request)
          .pipe(
            map(user => UserActions.loginSuccess({user})),
            tap(() => this.router.navigate([`/applications`])),
            catchError(error => of(UserActions.loginFailed({message: 'login failed'}))
            ),
          )
      )
    )
  );
}

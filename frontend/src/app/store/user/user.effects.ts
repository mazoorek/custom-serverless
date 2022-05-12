import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserActions} from './index';
import {catchError, map, of, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../app.reducers';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {User} from './user.model';

@Injectable()
export class UserEffects {

  constructor(private action$: Actions, private store: Store<AppState>, private http: HttpClient, private router: Router) {
  }

  fetchUser$ = createEffect(() =>
    this.action$.pipe(
      ofType(UserActions.fetchUserStart),
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

  signup$ = createEffect(() =>
    this.action$.pipe(
      ofType(UserActions.signupStart),
      switchMap((action) =>
        this.http.post<User>("/api/user/signup", action.request)
          .pipe(
            map(user => UserActions.signupSuccess({user})),
            tap(() => this.router.navigate([`/applications`])),
            catchError(error => of(UserActions.signupFailed({message: 'signup failed'}))
            ),
          )
      )
    )
  );

  logout$ = createEffect(() =>
    this.action$.pipe(
      ofType(UserActions.logoutStart),
      switchMap((action) =>
        this.http.post<void>("/api/user/logout", {})
          .pipe(
            map(() => UserActions.logoutSuccess()),
            tap(() => this.router.navigate([`/login`])),
            catchError(error => of(UserActions.logoutFailed())
            ),
          )
      )
    )
  );
}

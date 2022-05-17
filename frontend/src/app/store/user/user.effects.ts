import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserActions} from './index';
import {catchError, map, of, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../app.reducers';
import {Router} from '@angular/router';
import {UserService} from '../../user/user.service';

@Injectable()
export class UserEffects {

  constructor(private action$: Actions, private store: Store<AppState>, private userService: UserService,
              private router: Router) {
  }

  fetchUser$ = createEffect(() =>
    this.action$.pipe(
      ofType(UserActions.fetchUserStart),
      switchMap((action) =>
        this.userService.fetchUserData()
          .pipe(
            map(user => UserActions.userFetchFinished({user})),
            catchError(error => of(UserActions.userFetchFinished({user: undefined})))
          )
      )
    ));

  login$ = createEffect(() =>
    this.action$.pipe(
      ofType(UserActions.loginStart),
      switchMap((action) =>
        this.userService.login(action.request)
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
        this.userService.signup(action.request)
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
        this.userService.logout()
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

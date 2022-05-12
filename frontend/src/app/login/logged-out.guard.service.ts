import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {map, Observable, switchMap, take, tap} from 'rxjs';
import {AppState} from '../store/app.reducers';
import {select, Store} from '@ngrx/store';
import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {UserActions} from '../store/user';
import {isLoggedOut, userDataFetched} from '../store/user/user.selectors';

@Injectable()
export class LoggedOutGuard implements CanActivate {

  constructor(private store: Store<AppState>, private router: Router, private action$: Actions) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store
      .pipe(
        select(userDataFetched),
        switchMap(userDataFetched => {
          if (userDataFetched) {
            return this.store
              .pipe(
                select(isLoggedOut),
                tap(loggedOut => {
                  if (!loggedOut) {
                    this.router.navigateByUrl('/applications');
                  }
                })
              )
          } else {
            return this.action$.pipe(
              ofType(UserActions.userFetchFinished),
              take(1),
              map(action => !action.user),
              tap(userNotLoggedIn => {
                if (!userNotLoggedIn) {
                  this.router.navigateByUrl('/login');
                }
              })
            );
          }
        })
      );
  }
}

import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {map, Observable, switchMap, take, tap} from 'rxjs';
import {AppState} from '../store/app.reducers';
import {select, Store} from '@ngrx/store';
import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {UserActions} from '../store/user';
import {HttpClient} from '@angular/common/http';
import {isLoggedIn, userDataFetched} from '../store/user/user.selectors';

@Injectable()
export class LoggedInGuard implements CanActivate {

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
                select(isLoggedIn),
                tap(loggedIn => {
                  if (!loggedIn) {
                    this.router.navigateByUrl('/login');
                  }
                })
              )
          } else {
            return this.action$.pipe(
              ofType(UserActions.userFetchFinished),
              take(1),
              map(action => !!action.user),
              tap(userData => {
                if (!userData) {
                  this.router.navigateByUrl('/login');
                }
              })
            );
          }
        })
      );
  }
}

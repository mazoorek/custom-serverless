import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {filter, finalize, first, Observable, tap} from 'rxjs';
import {AppState} from '../store/app.reducers';
import {select, Store} from '@ngrx/store';
import {loadApplication} from '../store/applications/applications.actions';
import {Injectable} from '@angular/core';
import {applicationsLoaded} from '../store/applications/applications.selectors';

@Injectable()
export class ApplicationResolver implements Resolve<any> {

  loading: boolean = false;

  constructor(private store: Store<AppState>) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.store.pipe(
      select(applicationsLoaded),
      tap(applicationsLoaded => {
        if(!this.loading && !applicationsLoaded) {
          this.loading = true;
          this.store.dispatch(loadApplication());
        }
      }),
      filter(applicationsLoaded => applicationsLoaded),
      first(),
      finalize(() => this.loading = false)
    );
  }

}

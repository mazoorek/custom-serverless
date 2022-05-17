import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {filter, finalize, first, Observable, of, tap} from 'rxjs';
import {AppState} from '../store/app.reducers';
import {select, Store} from '@ngrx/store';
import {loadApplication} from '../store/applications/applications.actions';
import {Injectable} from '@angular/core';
import {areApplicationsLoaded} from '../store/applications/applications.selectors';

@Injectable()
export class ApplicationResolver implements Resolve<any> {

  loading: boolean = false;

  constructor(private store: Store<AppState>) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let appName = route.paramMap.get('id');
    return this.store.pipe(
      tap(() => {
        if(!this.loading) {
          this.loading = true;
          this.store.dispatch(loadApplication({appName: appName!}));
        }
      }),
      first(),
      finalize(() => this.loading = false)
    );
  }
}

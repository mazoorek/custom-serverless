import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {finalize, first, Observable, tap} from 'rxjs';
import {AppState} from '../store/app.reducers';
import {Store} from '@ngrx/store';
import {loadApplications} from '../store/applications/applications.actions';
import {Injectable} from '@angular/core';

@Injectable()
export class ApplicationsResolver implements Resolve<any> {

  loading: boolean = false;

  constructor(private store: Store<AppState>) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.store.pipe(
      tap(() => {
        if(!this.loading) {
          this.loading = true;
          this.store.dispatch(loadApplications());
        }
      }),
      first(),
      finalize(() => this.loading = false)
    );
  }

}

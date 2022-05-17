import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducers';
import {finalize, first, Observable, tap} from 'rxjs';
import {loadEndpoint} from '../../store/applications/applications.actions';

@Injectable()
export class EndpointResolver implements Resolve<any> {

  loading: boolean = false;

  constructor(private store: Store<AppState>) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let appName = route.paramMap.get('id');
    let endpointUrl = route.paramMap.get('endpointId');
    return this.store.pipe(
      tap(() => {
        if(!this.loading) {
          this.loading = true;
          this.store.dispatch(loadEndpoint({appName: appName!, endpointUrl: endpointUrl!}));
        }
      }),
      first(),
      finalize(() => this.loading = false)
    );
  }
}

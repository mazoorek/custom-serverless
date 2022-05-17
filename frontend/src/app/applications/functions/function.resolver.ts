import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducers';
import {finalize, first, Observable, tap} from 'rxjs';
import {loadEndpoint, loadFunction} from '../../store/applications/applications.actions';

@Injectable()
export class FunctionResolver implements Resolve<any> {

  loading: boolean = false;

  constructor(private store: Store<AppState>) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let appName = route.paramMap.get('id');
    let functionName = route.paramMap.get('functionId');
    return this.store.pipe(
      tap(() => {
        if(!this.loading) {
          this.loading = true;
          this.store.dispatch(loadFunction({appName: appName!, functionName: functionName!}));
        }
      }),
      first(),
      finalize(() => this.loading = false)
    );
  }
}

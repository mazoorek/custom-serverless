import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, map, Observable, shareReplay, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {UserState} from '../store/user/user.model';
import {UserActions} from '../store/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface User {
  id?: string;
  email?: string
}

export const ANONYMOUS_USER: User = {
  id: undefined
}

@Injectable({providedIn: 'root'})
export class AuthService {

  constructor(private http: HttpClient, private store: Store<UserState>) {
    // this.fetchUserData();
  }

  fetchUserData(): void {
    this.http.get<User>('/api/user').subscribe(user => {
      if(user) {
        this.store.dispatch(UserActions.loginSuccess({user}));
      }
    });
  }

  logIn(request: LoginRequest): Observable<User> {
    return this.http.post<User>("/api/user/login", request).pipe(
      shareReplay(),
      tap(user => this.store.dispatch(UserActions.loginSuccess({user}))
      )
    );
  }

  signUp(request: SignupRequest): Observable<User> {
    return this.http.post<User>("/api/user/signup", request).pipe(
      shareReplay(),
      tap(user => this.store.dispatch(UserActions.loginSuccess({user})))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>("/api/user/logout", {}).pipe(
      shareReplay(),
      tap(_ => this.store.dispatch(UserActions.logout()))
    );
  }
}

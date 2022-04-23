import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, map, Observable, shareReplay, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';

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
}

export const ANONYMOUS_USER : User = {
  id: undefined
}
@Injectable({providedIn: 'root'})
export class AuthService {

  private subject = new BehaviorSubject<User | undefined>(undefined);

  user$: Observable<User> = this.subject.asObservable()
    .pipe(
      filter(user => !!user),
      map(user => user as User)
    );

  isLoggedIn$: Observable<boolean> = this.user$.pipe(
    map(user => !!user.id)
  );

  isLoggedOut$: Observable<boolean> = this.isLoggedIn$.pipe(
    map(isLoggedIn => !isLoggedIn)
  );

  constructor(private http: HttpClient) {
    this.fetchUserData();
  }

  fetchUserData(): void {
    this.http.get<User>('/api/user').subscribe(user => this.subject.next(user ? user : ANONYMOUS_USER));
  }

  logIn(request: LoginRequest): Observable<User> {
    return this.http.post<User>("/api/user/login", request).pipe(
      shareReplay(),
      tap(user => this.subject.next(user))
    );
  }

  signUp(request: SignupRequest): Observable<User> {
    return this.http.post<User>("/api/user/signup", request).pipe(
      shareReplay(),
      tap(user => this.subject.next(user))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>("/api/user/logout", {}).pipe(
      shareReplay(),
      tap(() => this.subject.next(ANONYMOUS_USER))
    );
  }
}

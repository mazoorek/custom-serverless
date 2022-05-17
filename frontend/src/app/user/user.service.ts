import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ChangeEmailRequest, ChangePasswordRequest, LoginRequest, User} from '../store/user/user.model';

@Injectable({providedIn: "root"})
export class UserService {

  constructor(private http: HttpClient) {
  }

  fetchUserData(): Observable<User> {
    return this.http.get<User>('/api/user');
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>("/api/user/login", request);
  }

  signup(request: LoginRequest): Observable<User> {
    return this.http.post<User>("/api/user/signup", request);
  }

  logout(): Observable<void> {
    return  this.http.post<void>("/api/user/logout", {})
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>("/api/user/password", request);
  }

  changeEmail(request: ChangeEmailRequest): Observable<void> {
    return this.http.put<void>("/api/user/email", request);
  }
}

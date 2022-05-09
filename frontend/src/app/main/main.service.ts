import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface TestFunctionRequest {
  code: string;
  args: any;
  cache: any;
  edgeResults: any;
  clientAppName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({providedIn: "root"})
export class MainService {

  constructor(private http: HttpClient) {
  }

  getApps(): Observable<string[]> {
    return this.http.get<string[]>("/api/ingress");
  }

  createApps(clientAppName: string): Observable<void> {
    return this.http.post<void>("/api/ingress", {clientAppName: clientAppName});
  }

  savePackageJson(appName: string, code: string): Observable<void> {
    return this.http.post<void>(`/api/applications/${appName}/dependencies`, {code: code});
  }

  getRuntime(appName: string): Observable<{ runtimeReady: string }> {
    return this.http.get<{ runtimeReady: string }>(`/api/runtime/${appName}`);
  }

  testFunction(request: TestFunctionRequest): Observable<void> {
    return this.http.post<void>("/api/test", request);
  }

  login(request: LoginRequest): Observable<void> {
    return this.http.post<void>("/api/login", request);
  }
}

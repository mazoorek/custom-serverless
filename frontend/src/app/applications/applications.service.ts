import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';

export interface TestFunctionRequest {
  code: string;
  args: any;
  clientAppName: string;
}

export interface Endpoint {
  url: string;
  functionName: string;
}

export interface Function {
  name: string;
  content: string;
  idempotent: boolean;
}

export interface Application {
  name: string;
  up: boolean;
  endpoints: Endpoint[];
  functions: Function[];
  packageJson: string;
}

export interface DependenciesResponse {
  valid: boolean;
  errors: string[];
}

@Injectable({providedIn: "root"})
export class ApplicationsService {
  currentApplication!: Application;
  currentFunction!: Function;


  constructor(private http: HttpClient) {
  }

  getApps(): Observable<Application[]> {
    return this.http.get<Application[]>("/api/applications");
  }

  createApp(clientAppName: string): Observable<void> {
    return this.http.post<void>("/api/applications", {clientAppName: clientAppName});
  }

  createFunction(clientAppName: string, functionName: string): Observable<void> {
    return this.http.post<void>(`/api/applications/${clientAppName}/functions`, {name: functionName});
  }

  editFunction(clientAppName: string, functionName: string, request: Function): Observable<void> {
    return this.http.patch<void>(`/api/applications/${clientAppName}/functions/${functionName}`, request);
  }

  deleteFunction(clientAppName: string, functionName: string): Observable<void> {
    return this.http.delete<void>(`/api/applications/${clientAppName}/functions/${functionName}`);
  }

  getApp(clientAppName: string): Observable<Application> {
    return this.http.get<Application>(`/api/applications/${clientAppName}`).pipe(
      tap(app => this.currentApplication = app)
    );
  }

  getFunction(clientAppName: string, functionName: string): Observable<Function> {
    return this.http.get<Function>(`/api/applications/${clientAppName}/functions/${functionName}`).pipe(
      tap(func => this.currentFunction = func)
    );
  }

  testFunction(request: TestFunctionRequest): Observable<void> {
    return this.http.post<void>("/api/test", request);
  }

  getRuntime(appName: string): Observable<{ runtimeReady: string }> {
    return this.http.get<{ runtimeReady: string }>(`/api/runtime/${appName}`);
  }

  editApp(oldAppName: string, newAppName: string): Observable<void> {
    return this.http.patch<void>(`/api/applications/${oldAppName}`, {newAppName: newAppName});
  }

  deleteApp(clientAppName: string): Observable<void> {
    return this.http.delete<void>(`/api/applications/${clientAppName}`);
  }

  startApp(clientAppName: string): Observable<void> {
    return this.http.post<void>(`/api/applications/${clientAppName}/start`, {});
  }

  stopApp(clientAppName: string): Observable<void> {
    return this.http.post<void>(`/api/applications/${clientAppName}/stop`, {});
  }

  saveDependencies(appName: string, code: string): Observable<DependenciesResponse> {
    return this.http.post<DependenciesResponse>(`/api/applications/${appName}/dependencies`, {code: code});
  }
}

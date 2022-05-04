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
  content: string
}

export interface Application {
  name: string;
  up: boolean;
  endpoints: Endpoint[];
  functions: Function[];
  packageJson: string;
}

@Injectable({providedIn: "root"})
export class ApplicationsService {
  currentApplication!: Application;


  constructor(private http: HttpClient) {
  }

  getApps(): Observable<Application[]> {
    return this.http.get<Application[]>("/api/applications");
  }

  createApp(clientAppName: string): Observable<void> {
    return this.http.post<void>("/api/applications", {clientAppName: clientAppName});
  }

  getApp(clientAppName: string): Observable<Application> {
    return this.http.get<Application>(`/api/applications/${clientAppName}`).pipe(
      tap(app => this.currentApplication = app)
    );
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
}

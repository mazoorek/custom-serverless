import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface TestFunctionRequest {
  code: string;
  args: any;
  clientAppName: string;
}

export interface Application {
  name: string;
  up: boolean;
}

@Injectable({providedIn: "root"})
export class ApplicationsService {


  constructor(private http: HttpClient) {
  }

  getApps(): Observable<Application[]> {
    return this.http.get<Application[]>("/api/applications");
  }

  createApps(clientAppName: string): Observable<void> {
    return this.http.post<void>("/api/applications", {clientAppName: clientAppName});
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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface TestFunctionRequest {
  code: string;
  args: any;
  clientAppName: string;
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

  validatePackageJson(code: string): Observable<void> {
    return this.http.post<void>("/api/validate", {code: code});
  }

  testFunction(request: TestFunctionRequest): Observable<void> {
    return this.http.post<void>("/api/test", request);
  }
}

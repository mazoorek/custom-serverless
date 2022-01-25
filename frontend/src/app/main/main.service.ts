import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: "root"})
export class MainService {

  constructor(private http: HttpClient) {
  }

  getApps(): Observable<String[]> {
    return this.http.get<String[]>("/api/ingress");
  }

  createApps(clientAppName: String): Observable<void> {
    return this.http.post<void>("/api/ingress", {clientAppName: clientAppName});
  }
}

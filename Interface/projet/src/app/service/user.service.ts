import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { User } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser<T>(url: string): Observable<User> {
    return this.http.get<T>('http://localhost:3000/get-user') as Observable<User>;
  }

  login(user: User): Observable<void>  {
    return this.http.post<void>('http://localhost:3000/login', user, { withCredentials: true });
  }

  logout():Observable<void> {
    return this.http.post<void>('http://localhost:3000/logout', {}, { withCredentials: true });
  }

  isConnected(): Observable<boolean> {
    return this.http.get<{ connected: boolean }>('http://localhost:3000/isConnected', { withCredentials: true }).pipe(
      map(response => response.connected),
      catchError(() => of(false))
    );
  }
}

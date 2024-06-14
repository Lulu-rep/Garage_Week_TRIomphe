import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SensorData } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  getData<T>(url: string): Observable<Array<SensorData>> {
    return this.http.get<T>(url) as Observable<Array<SensorData>>;
  }
}
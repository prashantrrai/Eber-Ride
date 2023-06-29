import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmrideService {
  
  private serverUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) { }
  
  // getride(): Observable<any>{
  //   return this.http.get(`${this.serverUrl}/ridedata`);
  // }
  getride(): Observable<any>{
    return this.http.get(`${this.serverUrl}/ridesinfo`);
  }
}

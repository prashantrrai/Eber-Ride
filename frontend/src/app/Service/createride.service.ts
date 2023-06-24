import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreaterideService {
  private serverUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) { }

  getUserByNumber(number: any) {
    return this.http.get<any>(`${this.serverUrl}/user/${number}`);
  }

  addRide(rideData: any) {
    return this.http.post<any>(`${this.serverUrl}/addride`, rideData);
  }

  getServiceType(cityId: any) {
    return this.http.get<any>(`${this.serverUrl}/servicetype/ + cityId`);
  }


}

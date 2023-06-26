import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreaterideService {
  private serverUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) { }

  getUserByNumber(phonedata: any) {
    return this.http.post<any>(`${this.serverUrl}/userdata/number`, phonedata);
  }

  addRide(rideData: any) {
    return this.http.post<any>(`${this.serverUrl}/addride`, rideData);
  }

  getServiceType(cityId: any) {
    // console.log(cityId)
    return this.http.get<any>(`${this.serverUrl}/vehicle/${cityId}`);
  }


}

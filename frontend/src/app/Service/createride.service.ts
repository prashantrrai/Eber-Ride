import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreaterideService {
  // private serverUrl = 'http://localhost:4000';
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';


  constructor(private http: HttpClient) { }

  getcode(): Observable<any> {
    return this.http.get(`${this.serverUrl}/countrydata`);
  }
  
  getUserByNumber(phonedata: any) {
    return this.http.post<any>(`${this.serverUrl}/userdata/number`, phonedata);
  }

  addRide(rideData: any) {
    return this.http.post<any>(`${this.serverUrl}/addride`, rideData);
  }

  getServiceType(cityId: any) {
    console.log("This is  CITY ID =======",cityId)
    return this.http.get<any>(`${this.serverUrl}/vehicle/${cityId}`);
  }


}

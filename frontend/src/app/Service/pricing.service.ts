import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  private serverUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) { }

  getCountryData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/countrydata`);
  }

  getCityData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/citydata`);
  }

  getServiceData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/vehicledata`);
  }

  addPricing(pricingdata: any): Observable<any> {
    // console.log(pricingdata)
    return this.http.post<any>(`${this.serverUrl}/addpricing`, pricingdata);
  }
  
}

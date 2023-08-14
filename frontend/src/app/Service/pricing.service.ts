import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  // private serverUrl = 'http://localhost:4000';
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';


  constructor(private http: HttpClient) { }

  getCountryData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/countrydata`);
  }

  getCityData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/citydata`);
  }

  getServiceData(data:any): Observable<any> {
    // console.log(data);
    
    return this.http.post(`${this.serverUrl}/vehicledata`, data);
  }

  addPricing(pricingdata: any): Observable<any> {
    // console.log(pricingdata)
    return this.http.post<any>(`${this.serverUrl}/addpricing`, pricingdata);
  }

  getPricingData(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.serverUrl}/pricingdata?page=${page}&limit=${limit}`);
  }

  deleteValues(id: any): Observable<any> {
    return this.http.delete(`${this.serverUrl}/deletepricing/${id}`);
  }

  UpdatePricing(id: any, data: any): Observable<any> {
    return this.http.put(`${this.serverUrl}/updatepricing/${id}`, data);
  }  
}

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

  getPricingData(search: string, page: number, limit: number): Observable<any> {
    return this.http.get(`${this.serverUrl}/pricingdata?search=${search}&page=${page}&limit=${limit}`);
  }

  deleteValues(id: any): Observable<any> {
    return this.http.delete(`${this.serverUrl}/deletepricing/${id}`);
  }

  UpdatePricing(id: any, data: any): Observable<any> {
    return this.http.put(`${this.serverUrl}/updatepricing/${id}`, data);
  }

  // searchPrice(query: string, page: number, limit: number): Observable<any> {
  //   // console.log(query, page, limit)
  //   return this.http.get(`${this.serverUrl}/searchpricing?query=${query}&page=${page}&limit=${limit}`);
  // }

  
}

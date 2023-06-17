import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {


  private serverUrl = 'http://localhost:4000';
  private countryAPI = 'https://restcountries.com/v3.1/all'


  constructor(private http: HttpClient) { }


  fetchCountryAPI(): Observable<any> {
    return this.http.get(`${this.countryAPI}`);
  }

  
  getCityData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/citydata`);
  }

  getVehicleData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/vehicledata`);
  }
  
  addDriver(driverData: any): Observable<any> {
    // console.log(driverData);
    return this.http.post<any>(`${this.serverUrl}/adddriver`, driverData);
  }
  
  getDriver(page: number, limit: number) {
    const url = `${this.serverUrl}/driverdata?page=${page}&limit=${limit}`;
    return this.http.get(url);
  }

  deleteDriver(userId: string): Observable<any> {
    const url = `${this.serverUrl}/driverdata/${userId}`;
    return this.http.delete<any>(url);
  }

  updateDriver(userId: string, userData: any): Observable<any> {
    // console.log(userData)
    const url = `${this.serverUrl}/updatedriver/${userId}`;
    return this.http.put<any>(url, userData);
  }

  searchDriver(query: string, page: number, limit: number): Observable<any> {
    // console.log(query, page, limit)
    return this.http.get(`${this.serverUrl}/driversearch?query=${query}&page=${page}&limit=${limit}`);
  }


}

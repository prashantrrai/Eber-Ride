import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  private serverUrl = 'http://localhost:4000';


  constructor(private http: HttpClient) { }

  getcountryData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/countrydata`);
  }


  addcity(city:any):Observable<any>{
    return this.http.post<any>(`${this.serverUrl}/addcity`, city );
  }

  getcity():Observable<any>{
    return this.http.get<any>(`${this.serverUrl}/citydata`);
  }

}

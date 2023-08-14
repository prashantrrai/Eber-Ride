import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  // private serverUrl = 'http://localhost:4000';
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';


  constructor(private http: HttpClient) { }

  getcountryData(): Observable<any> {
    return this.http.get(`${this.serverUrl}/countrydata`);
  }


  addcity(cityData:any):Observable<any>{
    return this.http.post<any>(`${this.serverUrl}/cityadd`, cityData );
  }

  getcity(page: number, limit: number):Observable<any>{
    const params = {
      page: page,
      limit: limit,
    };
    // console.log(params)
    const url = `${this.serverUrl}/citydata`;
    return this.http.get(url, { params: params });
  }
  // getcity():Observable<any>{
  //   return this.http.get(`${this.serverUrl}/citydata`);
  // }

  updateCity(cityId: string, cityData: any): Observable<any> {
    console.log(cityId)
    console.log(cityData)
    const url = `${this.serverUrl}/cityupdate/${cityId}`;
    return this.http.put<any>(url, cityData);
  }

  getCityPolygons(countryid: any):Observable<any>{
    console.log(countryid)
    return this.http.get<any>(`${this.serverUrl}/coordinates/${countryid}`);
  } 


}

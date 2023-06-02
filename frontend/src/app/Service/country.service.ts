import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private serverUrl = 'http://localhost:4000';


  constructor(private http: HttpClient) { }

  addCountry(countryData: any): Observable<any> {
    return this.http.post(`${this.serverUrl}/countryadd`, countryData);
  }

}

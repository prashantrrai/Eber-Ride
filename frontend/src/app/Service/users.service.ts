import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private serverUrl = 'http://localhost:4000';
  private countryAPI = 'https://restcountries.com/v3.1/all'


  constructor(private http: HttpClient) { }


  fetchCountryAPI(): Observable<any> {
    return this.http.get(`${this.countryAPI}`);
  }
  
  addUser(userData: any): Observable<any> {
    // console.log(userData);
    return this.http.post<any>(`${this.serverUrl}/adduser`, userData);
  }
  
  getuserData(): Observable<any> {
    return this.http.get<any>(`${this.serverUrl}/userdata`);
  }


  deleteUser(userId: string): Observable<any> {
    const url = `${this.serverUrl}/userdata/${userId}`;
    return this.http.delete<any>(url);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    console.log(userData)
    const url = `${this.serverUrl}/updateuser/${userId}`;
    return this.http.put<any>(url, userData);
  }
}

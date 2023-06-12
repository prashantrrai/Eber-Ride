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


  private getSessionHeaders(): HttpHeaders {
    const sessionToken = sessionStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`,
    });
  }

  fetchCountryAPI(): Observable<any> {
    return this.http.get(`${this.countryAPI}`);
  }
  
  addUser(userData: any): Observable<any> {
    console.log(userData);
    return this.http.post<any>(`${this.serverUrl}/adduser`, userData);
  }
  
  getuserData(): Observable<any> {
    const headers = this.getSessionHeaders();
    console.log(headers)
    return this.http.get<any>(`${this.serverUrl}/userdata`, { headers });
  }


  deleteUser(userId: string): Observable<any> {
    const url = `${this.serverUrl}/userdata/${userId}`;
    const headers = this.getSessionHeaders();
    return this.http.delete<any>(url, { headers });
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.serverUrl}/updateuser/${userId}`;
    const headers = this.getSessionHeaders();
    return this.http.put<any>(url, userData, { headers });
  }
}

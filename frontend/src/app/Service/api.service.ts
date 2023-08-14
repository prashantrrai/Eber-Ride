import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // private serverUrl = 'http://localhost:4000';
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';


  constructor(private http: HttpClient) { }

  private getSessionHeaders(): HttpHeaders {
    const sessionToken = sessionStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`,
    });
  }



  registerUser(userData: any): Observable<any> {
    // console.log(userData);
    return this.http.post<any>(`${this.serverUrl}/register`, userData);
  }
  
  getuserData(): Observable<any> {
    const headers = this.getSessionHeaders();
    return this.http.get<any>(`${this.serverUrl}/logindata`, { headers });
  }

  loginUser(loginData: any): Observable<any> {
    // console.log(loginData);
    return this.http.post<any>(`${this.serverUrl}/login`, loginData);
  }

  deleteUser(userId: string): Observable<any> {
    const url = `${this.serverUrl}/logindata/${userId}`;
    const headers = this.getSessionHeaders();
    return this.http.delete<any>(url, { headers });
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.serverUrl}/update/${userId}`;
    const headers = this.getSessionHeaders();
    return this.http.put<any>(url, userData, { headers });
  }
}
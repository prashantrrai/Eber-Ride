import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private serverUrl = 'http://localhost:4000/user';

  constructor(private http: HttpClient) { }


  private getSessionHeaders(): HttpHeaders {
    const sessionToken = sessionStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`,
    });
  }
  
  addUser(userData: any): Observable<any> {
    // console.log(userData);
    return this.http.post<any>(`${this.serverUrl}/register`, userData);
  }
  
  getuserData(): Observable<any> {
    const headers = this.getSessionHeaders();
    return this.http.get<any>(`${this.serverUrl}/userdata`, { headers });
  }


  deleteUser(userId: string): Observable<any> {
    const url = `${this.serverUrl}/userdata/${userId}`;
    const headers = this.getSessionHeaders();
    return this.http.delete<any>(url, { headers });
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.serverUrl}/update/${userId}`;
    const headers = this.getSessionHeaders();
    return this.http.put<any>(url, userData, { headers });
  }
}

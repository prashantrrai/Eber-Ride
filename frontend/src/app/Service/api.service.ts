import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  signupAPI = 'http://localhost:4000/register';
  loginAPI = 'http://localhost:4000/login';
  getUserAPI = 'http://localhost:4000/logindata';
  deleteUserAPI = 'http://localhost:4000/logindata';
  updateUserAPI = 'http://localhost:4000/update';

  constructor(private http: HttpClient) { }

  registerUser(userData: any): Observable<any> {
    console.log(userData);
    return this.http.post<any>(this.signupAPI, userData);
  }

  getuserData(): Observable<any> {
    return this.http.get<any>(this.getUserAPI);
  }

  loginUser(loginData: any): Observable<any> {
    console.log(loginData);
    return this.http.post<any>(this.loginAPI, loginData);
  }

  deleteUser(userId: string): Observable<any> {
    const url = `${this.deleteUserAPI}/${userId}`;
    return this.http.delete<any>(url);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.updateUserAPI}/${userId}`;
    return this.http.put<any>(url, userData);
  }
}
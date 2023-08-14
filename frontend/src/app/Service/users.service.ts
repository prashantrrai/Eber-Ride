import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  // private serverUrl = 'http://localhost:4000';
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';
  
  private countryAPI = 'https://restcountries.com/v3.1/all'


  constructor(private http: HttpClient) { }


  // fetchCountryAPI(): Observable<any> {
  //   return this.http.get(`${this.countryAPI}`);
  // }
  getcode(): Observable<any> {
    return this.http.get(`${this.serverUrl}/countrydata`);
  }
  
  addUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.serverUrl}/adduser`, userData);
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

  // getUsers(search: string ,page: number, limit: number) {
  //   const url = `${this.serverUrl}/userdata?search=${search}&page=${page}&limit=${limit}`;
  //   return this.http.get(url);
  // }
  getUsers(search: string, page: number, limit: number, sortBy: string, sortOrder: string): Observable<any> {
    const params = {
      search: search,
      page: page.toString(),
      limit: limit.toString(),
      sortBy: sortBy,
      sortOrder: sortOrder
    };
    const url = `${this.serverUrl}/userdata`;
    return this.http.get(url, { params: params });
  }

}

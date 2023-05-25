import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  signupAPI = 'http://localhost:4000/register'
  loginAPI = 'http://localhost:4000/login'
  getUserAPI = 'http://localhost:4000/logindata'

  constructor(private http:HttpClient) { }

  // personDataArray: any[] = [{ name: 'Prashant Rai', email: 'prashant@gmail.com', password: 'fsdk' }];


  registerUser(userData : any){
   console.log(userData);
   return this.http.post<any>(this.signupAPI , userData)
  }

  getuserData(){
    return this.http.get(this.getUserAPI)
  }

  loginUser(loginData: any){
    console.log(loginData);
    return this.http.post<any>(this.loginAPI , loginData)
  }
}

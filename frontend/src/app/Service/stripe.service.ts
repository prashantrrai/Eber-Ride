import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  // url = "http://localhost:4000"
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';


  constructor(private http :HttpClient) { }

  getcard(id:any ){
    // console.log(id);
    return this.http.get(`${this.serverUrl}/getcard/` + id)
  }

  deletecard(id:any){
    return this.http.delete(`${this.serverUrl}/deletecard/` + id)
  }
}

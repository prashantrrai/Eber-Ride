import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  url = "http://localhost:4000"

  constructor(private http :HttpClient) { }

  getcard(id:any ){
    // console.log(id);
    return this.http.get(`${this.url}/getcard/` + id)
  }

  deletecard(id:any){
    return this.http.delete(`${this.url}/deletecard/` + id)
  }
}

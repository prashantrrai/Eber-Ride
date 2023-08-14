import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmrideService {
  
  // private serverUrl = 'http://localhost:4000';
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';


  constructor(private http: HttpClient) { 
  }
  
  getride(page: Number, limit: Number, search: String, statusfilter: Number, vehiclefilter: String, sortOrder: String): Observable<any>{
    return this.http.post(`${this.serverUrl}/ridesinfo`,{page, limit, search, statusfilter, vehiclefilter, sortOrder});
  }

  getMatchedDriverdata(data: any): Observable<any> {
    const url = `${this.serverUrl}/assigneddriverdata`;
    return this.http.post(url,data);
  }

}

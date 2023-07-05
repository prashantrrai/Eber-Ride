import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmrideService {
  
  private serverUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) { }
  
  // getride(): Observable<any>{
  //   return this.http.get(`${this.serverUrl}/ridedata`);
  // }
  getride(): Observable<any>{
    return this.http.get(`${this.serverUrl}/ridesinfo`);
  }

  getMatchedDriverdata(data: any): Observable<any> {
    // console.log(data);
    const url = `${this.serverUrl}/assigneddriverdata`;
    return this.http.post(url,data);
  }
  cancelride(rideid: string){
    return this.http.delete<any>(`${this.serverUrl}/ridesinfo/${rideid}`)
  }
}

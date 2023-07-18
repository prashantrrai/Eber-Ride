import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ConfirmrideService {
  private socket: Socket;
  
  private serverUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) { 
    this.socket = io(this.serverUrl); 
  }
  
  // getride(): Observable<any>{
  //   return this.http.get(`${this.serverUrl}/ridedata`);
  // }
  getride(page: Number, limit: Number, search: String, statusfilter: Number, vehiclefilter: String, sortOrder: String): Observable<any>{
    // console.log(statusfilter, vehiclefilter);
    // console.log(sortOrder);
    
    return this.http.post(`${this.serverUrl}/ridesinfo`,{page, limit, search, statusfilter, vehiclefilter, sortOrder});
  }

  getMatchedDriverdata(data: any): Observable<any> {
    // console.log(data);
    const url = `${this.serverUrl}/assigneddriverdata`;
    return this.http.post(url,data);
  }
  // cancelride(rideid: string){
  //   console.log(rideid);
    
  //   return this.http.delete<any>(`${this.serverUrl}/ridesinfo/${rideid}`)
  // }


  //--------------------------CANCEL RIDE BY USER------------------------------//
  listencancelride(cancelridedata: string): Observable<any>  {

    return new Observable(observer => {
      this.socket.on(cancelridedata, (ridedata: any) => {
        // console.log(ridedata)

        observer.next(ridedata)
      })
    })
    
  }

  emitcancelride(cancelride: string, rideId: any){
    // console.log(rideId);
    this.socket.emit(cancelride, rideId)
  }


  // //-----------------__FILTER DATA------------------------//
  // getfilterdata(){
    
  // }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class RidehistoryService {
  private socket: Socket;
  private url = 'http://localhost:4000'

  constructor(private http: HttpClient) {
    this.socket = io(this.url)
  }

  //----------------------DOWNLAOD RIDE-HISTORY DATA---------------------//
  getride(filterdata: any): Observable<any>{
    // console.log(statusfilter, vehiclefilter);
    // console.log(sortOrder);
    
    return this.http.post(`${this.url}/downloadridehistory`,{filterdata});
  }

  // --------------------------To GET RIDE-HISTORY DATA---------------------------------//
  emitridehistory(ridehistory: string, filterdata: any){
    this.socket.emit(ridehistory, filterdata)
  }
  

  listenridehistory(ridehistorydata: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(ridehistorydata, (data: any) => {
        // console.log(data)

        observer.next(data)
      })
    })
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

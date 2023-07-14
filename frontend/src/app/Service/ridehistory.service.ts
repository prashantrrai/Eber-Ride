import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class RidehistoryService {
  private socket: Socket;
  private url = 'http://localhost:4000'

  constructor() {
    this.socket = io(this.url)
  }

  // --------------------------To GET RIDE-HISTORY DATA---------------------------------//
  emitridehistory(ridehistory: string){
    this.socket.emit(ridehistory)
  }

  listenridehistory(ridehistorydata: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(ridehistorydata, (data: any) => {
        console.log(data)

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

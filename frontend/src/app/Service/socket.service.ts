import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
     this.socket = io('http://localhost:4000'); 
    }

  updatedriverStatus(driverId: string, status: boolean) : void {
    console.log(driverId, status);
    this.socket.emit('driverstatus', { driverId, status});
  }

  onUpdateStatusData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('statusdata', (data) => {
        // console.log(data);
        observer.next(data);
      });
    });
  }

  // updateDriverRide(driverrideId: string, driverId: string, assignedvalue: string, created: string): void {
  //   this.socket.emit('updatedriverride', { driverrideId, driverId, assignedvalue, created });
  // }

  getAssignedDriverData(cityId: string, serviceId: string): void {
    console.log(cityId, serviceId);
    this.socket.emit('assigneddriverdata', { cityId, serviceId });
    
  }

  onAssignedDriverData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('driverdata', (data) => {
        console.log(data);
        
        observer.next(data);
      });
    });
  }
}

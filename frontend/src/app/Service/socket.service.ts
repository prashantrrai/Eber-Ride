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


  // -----------------------------DRIVER STATUS UPDATE-----------------------------//
  updatedriverStatus(driverId: string, status: boolean) : void {
    // console.log(driverId, status);
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

  // -----------------------------ASSIGNED DRIVER UPDATE-----------------------------//
  getAssignedDriverData(cityId: string, serviceId: string): void {
    // console.log(cityId, serviceId);
    this.socket.emit('assigneddriverdata', { cityId, serviceId });
    
  }

  onAssignedDriverData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('driverdata', (data) => {
        // console.log(data);
        
        observer.next(data);
      });

    });
  }

    // -----------------------------DRIVER SERVICE UPDATE-----------------------------//
    updatedriverService( driverId: string, servicetype: any ) : void {
      // console.log(driverId, servicetype);
      this.socket.emit('driverService', { driverId, servicetype});
    }
  
    onUpdateServiceData(): Observable<any> {
      return new Observable((observer) => {
        this.socket.on('servicedata', (data) => {
          console.log(data);
  
          observer.next(data);
        });
      });
    }


    //-----------------------------------ASSIGN DRIVER FROM DIALOG REF BUTTON-------------------------------------//
    FinalassignedDriver( driverId: string , rideId: string ): void {
      // console.log(rideId, driverId);
      this.socket.emit('afterassigneddriver', { driverId, rideId});
      
    }

    onFinalassignedDriverData(): Observable<any> {
      return new Observable((observer) => {
        this.socket.on('driverdata', (data) => {
          console.log(data);
  
          observer.next(data);
        });
      });
    }

}

import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy{
  private socket: Socket;
  url = 'http://localhost:4000'


  constructor() {
     this.socket = io(this.url); 
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
    this.socket.emit('driverdata', { cityId, serviceId });
    
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
      // console.log(driverId, rideId);

      this.socket.emit("AssignedData", {driverId, rideId});   
    }

    onFinalassignedDriverData(data: String): Observable<any> {
      return new Observable((observer) => {
        this.socket.on('data', (data: any) => {
          console.log("ichsohiedkvhhedhocvhwsfi",data);
  
          observer.next(data);
        });
      });
    }





    ngOnDestroy() {
      if (this.socket) {
        this.socket.disconnect();
      }
    }

}

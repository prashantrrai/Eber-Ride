

import { Injectable, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnInit, OnDestroy{
  private socket: Socket;
  url = 'http://localhost:4000'
  // private errorSub: Subscription = new Subscription()

  constructor(private _notification: NotificationsService) {
     this.socket = io(this.url); 
    }

  ngOnInit(): void{
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

    // ----------------------SHOW DRIVER DATA OF PARTICULAR CITY AND SERVICE ,STATUS TRUE--------------------------/
  getAssignedDriverData(cityId: string, serviceId: string): void {
    // console.log(cityId, serviceId);
    this.socket.emit('showdriverdata', { cityId, serviceId });
    
  }

  onAssignedDriverData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('availabledriverdata', (data) => {
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
    emitassignedDriver( driverId: string , rideId: string ): void {
      // console.log(driverId, rideId);

      this.socket.emit("AssignedData", {driverId, rideId});   
    }

    onFinalassignedDriverData(data: String): Observable<any> {
      return new Observable((observer) => {
        this.socket.on('newdata', (data: any) => {
          // console.log("ichsohiedkvhhedhocvhwsfi",data);
  
          observer.next(data);
        });
      });
    }


    //-----------------------------------NEAREST DRIVER FROM DIALOG REF BUTTON-------------------------------------//
<<<<<<< HEAD
<<<<<<< HEAD
    emitnearestdriver( rideId: string, cityId: string, serviceId: string ): void {
      // console.log(driverId, rideId);

      this.socket.emit("nearestdata", {rideId, cityId, serviceId});   
=======
    emitnearestdriver( driverId: string , rideId: string, cityId: string, serviceId: string ): void {
      console.log(driverId, rideId, cityId, serviceId);

      this.socket.emit("nearestdata", {driverId, rideId, cityId, serviceId});   
>>>>>>> e732e0c (Crone Nearest Assign | First Driver pushed in nearestArray and free in 30sec)
=======
    emitnearestdriver( rideId: string, cityId: string, serviceId: string ): void {
      // console.log(rideId, cityId, serviceId);

      this.socket.emit("nearestdata", {rideId, cityId, serviceId});   
>>>>>>> 88c3aca (changed status--> ridestatus | -->)
    }

    listeningnearestdriver(): Observable<any> {
      return new Observable((observer) => {
        this.socket.on('datanearest', (data: any) => {
          console.log(data);
  
          observer.next(data);
        });
      });
    }


    //--------------------------------RUNNING REQUEST DRIVER-----------------------------------------//
    listenGetRunning(): Observable<any> {
      return new Observable(observer => {
        this.socket.on('runningdata', (data: any) => {
          // console.log(data)

          observer.next(data)
        })
      })
    }

    emitRunningData() {
      this.socket.emit('runningrequest')
    }


    //--------------------------REJECT RIDE BY DRIVER------------------------------//
    listenrejectRunningRequest(): Observable<any>  {

      return new Observable(observer => {
        this.socket.on('runningrequestreject', (data: any) => {
          console.log(data)

          observer.next(data)
        })
      })
    }

    emitrejectRunningRequest(data: any){
      console.log(data);
      this.socket.emit('Rejectrunningrequest', data)
    }


    //--------------------------ACCEPT RIDE BY DRIVER------------------------------//
    listenacceptrunningrequest(): Observable<any>  {

      return new Observable(observer => {
        this.socket.on("runningrequestaccept", (data: any) => {
          console.log(data)

          observer.next(data)
        })
      })
    }

    emitacceptrunningrequest(data: any){
      console.log(data);
      this.socket.emit("acceptrunningreuest", data)
    }


    //------------TIMEOUT RUNNING REQUEST--------------------//
    listeningrunningtimeoutinRR(){
      return new Observable(observer => {
        this.socket.on("timeoutdata", (data: any) => {
          // console.log(data)

          observer.next(data)
        })
      })
    }

    //------------TIMEOUT RUNNING REQUEST in CFR--------------------//
    listeningtimeoutstatusinCFR(){
      return new Observable(observer => {
        this.socket.on("timeoutdata", (data: any) => {
          // console.log(data)

          observer.next(data)
        })
      })
    }


    //--------------------------CANCEL RIDE BY USER------------------------------//
    listencancelride(): Observable<any>  {

      return new Observable(observer => {
        this.socket.on('cancelridedata', (ridedata: any) => {
          // console.log(ridedata)

          observer.next(ridedata)
        })
      })
    }

    emitcancelride( rideId: any){
      this.socket.emit('cancelride', rideId)
    }

    // --------------------------To GET RIDE-HISTORY DATA---------------------------------//
    listenridehistory(): Observable<any> {
      return new Observable(observer => {
        this.socket.on('ridehistorydata', (data: any) => {
          // console.log(data)
  
          observer.next(data)
        })
      })
    }

    emitridehistory(filterdata: any){
      this.socket.emit('ridehistory', filterdata)
    }

  //-------------------------Listening and Emiting data from Socket.IO------------------------//
  listeningnotification(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('pushnotification', (data: any) => {
      // console.log(data);
      this._notification.showDummyNotification(data)
      
      observer.next(data);
      });
    });
  }

  emitnotification(): void {
    this.socket.emit('notification');
  }






    
<<<<<<< HEAD
  ngOnDestroy(): void {
    // this.errorSub.unsubscribe();
    // this.driverNotFoundSub.unsubscribe();
    // this.decreaseCountSub.unsubscribe();
=======

  ngOnDestroy(): void {
    this.runningreqemitdata.unsubscribe();
>>>>>>> e732e0c (Crone Nearest Assign | First Driver pushed in nearestArray and free in 30sec)
  }

}

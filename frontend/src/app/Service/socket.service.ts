

import { Injectable, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnInit, OnDestroy{
  private socket: Socket;
  // url = 'http://localhost:4000'
  private url = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';

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
      // console.log("driverId:",driverId,  "rideId:",rideId);

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
    emitnearestdriver( rideId: string, cityId: string, serviceId: string ): void {
      // console.log(driverId, rideId);

      this.socket.emit("nearestdata", {rideId, cityId, serviceId});   
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


    //--------------------------REJECT RIDE BY DRIVER ASSIGN ONE------------------------------//
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

    //--------------------------REJECT RIDE BY DRIVER NEAREST ASSIGN------------------------------//
    listenassignrejected(): Observable<any>  {

      return new Observable(observer => {
        this.socket.on('assignrejected', (data: any) => {
          console.log(data)

          observer.next(data)
        })
      })
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
        this.socket.on("crontimeoutdata", (data: any) => {
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
          console.log(data);
          this._notification.showDummyNotification(data)
          
          observer.next(data);
          
        });
    });
  }
  
  emitnotification(): void {
    this.socket.emit('notification');
  }
  
  
  //---------------------------Listening emitted data from Timeout in myTask()--------------------------//
  listeningmytaskfunc(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('pushnotification', (data: any) => {
        console.log(data);
        
        observer.next(data);
      });
    });
  }


  //---------------------------Listening emitted data  from Timeout in myTask()--------------------------//
  listeningwhendriverisnearest(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('whendriverisnearest', (data: any) => {
        console.log(data);
        
        observer.next(data);
      });
    });
  }
    
  //--------------------------RIDE STATUS UPDATES FROM SOCKET------------------------------//
  listeningrideupdates(): Observable<any>  {
  
    return new Observable(observer => {
      this.socket.on("rideupdates", (data: any) => {
        // console.log(data)
  
        observer.next(data)
      })
    })
  }

  //--------------------------RIDE ACCEPT STATUS------------------------------//
  emitaccept(data: any): void {
    this.socket.emit('rideaccepted', data);
  }
  //--------------------------RIDE ARRIVED STATUS------------------------------//
  emitarrived(data: any): void {
    this.socket.emit('ridearrived', data);
  }
  //--------------------------RIDE PICKED STATUS------------------------------//
  emitpicked(data: any): void {
    this.socket.emit('ridepicked', data);
  }
  //--------------------------RIDE STARTED STATUS------------------------------//
  emitstarted(data: any): void {
    this.socket.emit('ridestarted', data);
  }
  //--------------------------RIDE COMPLETED STATUS------------------------------//
  emitcompleted(data: any): void {
    this.socket.emit('ridecompleted', data);
  }
  //--------------------------RIDE and DRIVER FREE STATUS------------------------------//
  emitfree(data: any): void {
    this.socket.emit('driverfree', data);
  }

  
        
  ngOnDestroy(): void {
    // this.errorSub.unsubscribe();
    // this.driverNotFoundSub.unsubscribe();
    // this.decreaseCountSub.unsubscribe();
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class RunningrequestService {
  private socket: Socket;
  private url = 'http://localhost:4000'

  constructor() {
    this.socket = io(this.url); 
   }



    //--------------------------------RUNNING REQUEST DRIVER-----------------------------------------//
    listenGetRunning(runningdata: string): Observable<any> {
      return new Observable(observer => {
        this.socket.on(runningdata, (data: any) => {
          // console.log(data)

          observer.next(data)
        })
      })
    }

    //-----------------To emit data from client to Server-----------------//
    emitRunningData(runningrequest: string) {
      this.socket.emit(runningrequest)
    }




    //--------------------------REJECT RIDE BY DRIVER------------------------------//
    listenrejectRunningRequest(notrunningdata: string, data: any): Observable<any>  {

      return new Observable(observer => {
        this.socket.on(notrunningdata, (data: any) => {
          //data coming from backend response ater emiting data in backend from frontend i.e, ON
          console.log(data)

          observer.next(data)
        })
      })
      
    }

    emitrejectRunningRequest(Rejectrunningrequest: string, data: any){

      console.log(data);
      //sending data to backend from frontend using emit
      this.socket.emit(Rejectrunningrequest, data)
    }

    //--------------------------ACCEPT RIDE BY DRIVER------------------------------//
    listenacceptrunningrequest(acceptedrunningrequestdata: string): Observable<any>  {

      return new Observable(observer => {
        this.socket.on(acceptedrunningrequestdata, (data: any) => {
          console.log(data)

          observer.next(data)
        })
      })
      
    }

    emitacceptrunningrequest(acceptrunningreuest: string, data: any){

      console.log(data);
      this.socket.emit(acceptrunningreuest, data)
    }
}

import { Component } from '@angular/core';
import { RunningrequestService } from 'src/app/Service/runningrequest.service';
import { SocketService } from 'src/app/Service/socket.service';

@Component({
  selector: 'app-runningrequest',
  templateUrl: './runningrequest.component.html',
  styleUrls: ['./runningrequest.component.css']
})
export class RunningrequestComponent {
  assignedArray: any;
  driverId: any;
  rideId: any;
  driverdata: any;

  constructor(
    private _socketservice: SocketService,
    private _runningRequestService: RunningrequestService
  ) { }

  ngOnInit() {
    this.getRunningData();
    this.assigneddriverfromAssignDialogBox();
    this.relatedtoprashantrai();

  }

  getRunningData() {
    // this._socketservice.emitRunningData('runningrequest','Data from frontend')
    this._runningRequestService.emitRunningData('runningrequest')
    
    this._runningRequestService.listenGetRunning('runningdata').subscribe((data: any) => {
      console.log(data);
        this.assignedArray = data.ridedata;
        console.log(this.assignedArray);
      });
  }


  rejectRide(data: any) {
    console.log(data);
    
    console.log("rideId", data._id);
    console.log("driverId", data.driverId);

    this.rideId = data._id
    this.driverId = data.driverId
    
    this.rejectRunningRequest(this.driverId,this.rideId);
  }


  //------------------------------RUNNING REQUEST REJECT------------------------------------//
  rejectRunningRequest(driverId: string, rideId: string){
    console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._runningRequestService.emitrejectRunningRequest('Rejectrunningrequest', data)
    this.getRunningData()
  }

  // 

  relatedtoprashantrai(){
    const data = {
      rideId: this.rideId,
      driverId: this.driverId
    }
    this._runningRequestService.listenrejectRunningRequest('notrunningdata',data).subscribe((response: any)=> {

      // Handle successful response coming from backend that is ON
      // console.log('Request rejected:', response);
      this.getRunningData()
    }
    );
    
  }


    //  when the assign the driver data that time show a running requeszt data 
    assigneddriverfromAssignDialogBox(){
      this._socketservice.onFinalassignedDriverData('data').subscribe((res:any)=>{
        this.getRunningData()
      })
    }



}

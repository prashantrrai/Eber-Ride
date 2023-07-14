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
    this.afterrejectrunningrequest();
    this.afteracceptrunningrequest()

  }

  getRunningData() {
    this._runningRequestService.emitRunningData('runningrequest')

    this._runningRequestService.listenGetRunning('runningdata').subscribe((data: any) => {
      // console.log(data);
      this.assignedArray = data.alldata;
      // console.log(this.assignedArray);
      
    });
  }

  //---------------ON REJECT RIDE REQUEST BUTTON CLICK--------------------//
  rejectRide(data: any) {
    // console.log(data);

    // console.log("rideId", data._id);
    // console.log("driverId", data.driverId);

    this.rideId = data._id
    this.driverId = data.driverId

    this.rejectRunningRequest(this.driverId, this.rideId);
  }

  //------------------------------RUNNING REQUEST REJECT------------------------------------//
  rejectRunningRequest(driverId: string, rideId: string) {
    console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._runningRequestService.emitrejectRunningRequest('Rejectrunningrequest', data)
    this.getRunningData()
  }



  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  acceptRide(data: any){
    // console.log(data);
    this.rideId = data._id
    this.driverId = data.driverId

    this.acceptrunningrequest(this.driverId, this.rideId);
  }

  //------------------------------ACCEPT REQUEST REJECT------------------------------------//
  acceptrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }
    
    this._runningRequestService.emitacceptrunningrequest('acceptrunningreuest', data)
    this.getRunningData()
  }

    // AFTER REJECTING RIDE
  afterrejectrunningrequest() {
    const data = {
      rideId: this.rideId,
      driverId: this.driverId
    }
    this._runningRequestService.listenrejectRunningRequest('notrunningdata', data).subscribe((response: any) => {
      this.getRunningData()
    }
    );
  }

    // AFTER ACCEPTING RIDE
    afteracceptrunningrequest() {

      this._runningRequestService.listenacceptrunningrequest('notrunningdata').subscribe((response: any) => {
        this.getRunningData()
      }
      );
    }


  //  when the assign the driver data that time show a running requeszt data 
  assigneddriverfromAssignDialogBox() {
    this._socketservice.onFinalassignedDriverData('data').subscribe((res: any) => {
      this.getRunningData()
    })
  }



}

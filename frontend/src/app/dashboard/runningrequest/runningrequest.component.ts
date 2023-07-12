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
    private runningRequestService: RunningrequestService
  ) { }

  ngOnInit() {
    this.getRunningData()
  }

  getRunningData() {
    
    // this._socketservice.emitRunningData('runningrequest','Data from frontend')
    this._socketservice.emitRunningData('runningrequest',"")
    
    this._socketservice.listenGetRunning('runningdata').subscribe((data: any) => {
      console.log(data);
        // this.assignedArray = data.driverdata;
        // console.log(this.assignedArray);
        this.assignedArray = data.ridedata;
        console.log(this.assignedArray);
        
        
      });
  }

  rejectRide(rideId: string) {
    console.log(rideId);
    
    this.rejectRunningRequest(rideId);
  }

  rejectRunningRequest(driverId: string): void {
    this.runningRequestService.rejectRunningRequest(driverId)
      .subscribe((response)=> {
          // Handle successful response
          console.log('Request rejected:', response);
        },
        error => {
          // Handle error
          console.error('Error rejecting request:', error);
        }
      );
  }




}

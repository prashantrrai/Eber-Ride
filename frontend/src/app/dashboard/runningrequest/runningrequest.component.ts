import { Component } from '@angular/core';
import { SocketService } from 'src/app/Service/socket.service';

@Component({
  selector: 'app-runningrequest',
  templateUrl: './runningrequest.component.html',
  styleUrls: ['./runningrequest.component.css']
})
export class RunningrequestComponent {
  driverArray: any[] = [];
  driverId: any;
  rideId: any;

  constructor(
    private _socketservice: SocketService
  ) { }

  ngOnInit() {
    this.getRunningData()
  }

  getRunningData() {
    this._socketservice.emitRunningData('runningrequest','Data from frontend')
    
    this._socketservice.listenGetRunning('runningdata').subscribe((data: any) => {
      console.log(data);
        // this.driverArray = data;
      // this._socketservice.getrunningdriver(this.driverId, this.rideId)
      
      // this._socketservice.onrunningrequest().subscribe((response) => {
        //   console.log(response);
        //   console.log(this.driverArray);
      });
      
    
  }


}

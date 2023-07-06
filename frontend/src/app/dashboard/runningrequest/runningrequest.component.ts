import { Component } from '@angular/core';
import { SocketService } from 'src/app/Service/socket.service';

@Component({
  selector: 'app-runningrequest',
  templateUrl: './runningrequest.component.html',
  styleUrls: ['./runningrequest.component.css']
})
export class RunningrequestComponent {
  driverArray: any[] =[];
  driverId: any;
  rideId: any;

  constructor(
    private _socketservice : SocketService
  ){}

  ngOnInit(){
    this.getDriverData()
  }

  getDriverData(){
    this._socketservice.onrunningrequest().subscribe({
      next: (response) => {
        console.log(response);
        // this._socketservice.getrunningdriver(this.driverId, this.rideId)

        this._socketservice.onrunningrequest().subscribe((response) => {
          console.log(response);
          this.driverArray = response;
          console.log(this.driverArray);
        });
      }
    })
  }

  
}

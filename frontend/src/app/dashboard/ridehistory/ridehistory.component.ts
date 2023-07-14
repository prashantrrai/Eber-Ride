import { Component, OnInit } from '@angular/core';
import { ConfirmrideService } from 'src/app/Service/confirmride.service';
import { RidehistoryService } from 'src/app/Service/ridehistory.service';

@Component({
  selector: 'app-ridehistory',
  templateUrl: './ridehistory.component.html',
  styleUrls: ['./ridehistory.component.css']
})
export class RidehistoryComponent implements OnInit {
  ridesArray: any[] = []

  statusLabels: { [key: number]: string } = {
    // 0: 'Pending',
    // 1: 'Assigning',
    // 2: 'Rejected',
    3: 'Cancelled',
    // 4: 'Accepted',
    // 5: 'Arrived',
    // 6: 'Started',
    7: 'Completed',
  };
  
  constructor(private _ridehistroy: RidehistoryService, private _confirmride: ConfirmrideService){}

  ngOnInit(){
    this.getRideHistory()
    this.aftercancelrideinrealtime()
  }
  getRideHistory() {
    
    this._ridehistroy.emitridehistory('ridehistory')

    this._ridehistroy.listenridehistory('ridehistorydata').subscribe((data: any) => {
      // console.log(data);
      this.ridesArray = data.ridesdata;
      
    });
  }

  aftercancelrideinrealtime(){
    this._confirmride.listencancelride('cancelridedata').subscribe((ridedata: any) => {
      this.getRideHistory()
    })

  }

}

import { Component, OnInit } from '@angular/core';
import { ConfirmrideService } from 'src/app/Service/confirmride.service';
import { RidehistoryService } from 'src/app/Service/ridehistory.service';
import { RunningrequestService } from 'src/app/Service/runningrequest.service';

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
  limit: number = 1;
  totalPages: number = 0;
  currentPage: number = 1;
  paginatedRideData: any[] = [];
  count: any;
  search: String = '';


  
  constructor(private _ridehistroy: RidehistoryService, private _confirmride: ConfirmrideService, private _runningrequest: RunningrequestService){}

  ngOnInit(){
    this.getRideHistory()
    this.aftercancelrideinrealtime()
    this.afteracceptrideinrealtime()
  }
  getRideHistory() {
    
    this._ridehistroy.emitridehistory('ridehistory')

    this._ridehistroy.listenridehistory('ridehistorydata').subscribe((data: any) => {
      // console.log(data);
      this.ridesArray = data.ridesdata;
      this.totalPages = data.totalPages;
      this.count = data.totalCount;
    });
  }
  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    console.log(this.limit);
    
    this.currentPage = 1;
    this.updatePaginatedDrivers();
    this.getRideHistory();
  }

  onPageChange(pageNumber: number) {
    console.log(pageNumber);
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginatedDrivers();
      this.getRideHistory(); 
    }
  }
  updatePaginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedRideData = this.ridesArray.slice(startIndex, endIndex);
  }


  aftercancelrideinrealtime(){
    this._confirmride.listencancelride('cancelridedata').subscribe((ridedata: any) => {
      this.getRideHistory()
    })
  }


  afteracceptrideinrealtime(){
    this._runningrequest.listenacceptrunningrequest('acceptedrunningrequestdata').subscribe((ridedata: any) => {
      this.getRideHistory()
    })
  }

}

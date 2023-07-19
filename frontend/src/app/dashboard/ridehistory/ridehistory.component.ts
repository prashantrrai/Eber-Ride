import { Component, OnInit } from '@angular/core';
import { ConfirmrideService } from 'src/app/Service/confirmride.service';
import { RidehistoryService } from 'src/app/Service/ridehistory.service';
import { RunningrequestService } from 'src/app/Service/runningrequest.service';
// import { createObjectCsvWriter } from 'csv-writer';

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
  currentPage: number = 1;
  limit: number = 5;
  totalPages: number = 0;
  paginatedRideData: any[] = [];
  count: any;

  startlocation: any = '';
  endlocation: any = '';
  paymentmode: any = '';
  Fromdate: any = '';
  Todate: any= '';
  status: Number = -1;
  

  
  constructor(
    private _ridehistroy: RidehistoryService, 
    private _confirmride: ConfirmrideService, 
    private _runningrequest: RunningrequestService,
    // private csvParser: NgxCsvParser
    ){}

  ngOnInit(){
    this.getRideHistory()
    this.aftercancelrideinrealtime()
    this.afteracceptrideinrealtime()
  }



  getRideHistory() {

    const filterdata = {
      "page": this.currentPage,
      "limit": this.limit,
      "payment": this.paymentmode,
      "fromdate": this.Fromdate,
      "todate": this.Todate,
      "status": this.status,
      "startlocationsearch": this.startlocation,
      "endlocationsearch": this.endlocation,
  }
  
    // console.log(filterdata);

    
    this._ridehistroy.emitridehistory('ridehistory', filterdata)

    this._ridehistroy.listenridehistory('ridehistorydata').subscribe((data: any) => {
      // console.log(data);
      this.ridesArray = data.myridehistory;
      this.totalPages = data.totalPages;
      this.count = data.totalCount;
    });
  }
  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    // console.log(this.limit);
    
    this.currentPage = 1;
    this.updatePaginatedDrivers();
    this.getRideHistory();
  }

  onPageChange(pageNumber: number) {
    // console.log(pageNumber);
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

  clearFilter() {
    this.status = -1;
    this.paymentmode = '';
    this.startlocation = ''
    this.endlocation = ''
    this.Fromdate = ''
    this.Todate = ''


    this.getRideHistory()
  }



  //----------------AFTER CANCEL RIDE IN REAL-TIME----------------//
  aftercancelrideinrealtime(){
    this._confirmride.listencancelride('cancelridedata').subscribe((ridedata: any) => {
      this.getRideHistory()
    })
  }

  //----------------AFTER ACCEPT RIDE IN REAL-TIME----------------//
  afteracceptrideinrealtime(){
    this._runningrequest.listenacceptrunningrequest('acceptedrunningrequestdata').subscribe((ridedata: any) => {
      this.getRideHistory()
    })
  }

  //----------------------DOWNLAOD RIDE-HISTORY DATA---------------------//
  downlaodallData(){
    const alldataatonce = {
      "payment": this.paymentmode,
      "fromdate": this.Fromdate,
      "todate": this.Todate,
      "status": this.status,
      "startlocationsearch": this.startlocation,
      "endlocationsearch": this.endlocation,
    }

    // console.log(alldataatonce);


    this._ridehistroy.downlaodallData(alldataatonce).subscribe({
      next: (response: any) => {
        console.log(response);
        // const csvWriter = createObjectCsvWriter({
        //   path: 'data.csv',
        //   header: ['First Name', 'Last Name'], // Modify headers based on your data structure
        // });
      },
      error: (error: any) => {
        console.log(error.error.message);
      },
    });
  }

  downloadDataAsCSV(){
    this.downlaodallData()
  }
}

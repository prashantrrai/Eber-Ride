import { Component, OnInit } from '@angular/core';
import { ConfirmrideService } from 'src/app/Service/confirmride.service';
import { RidehistoryService } from 'src/app/Service/ridehistory.service';
import { RunningrequestService } from 'src/app/Service/runningrequest.service';
import { Papa } from 'ngx-papaparse';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import * as authService_1 from 'src/app/Service/auth.service';
import { RidehistorydialogComponent } from 'src/app/shared/ridehistorydialog/ridehistorydialog.component';
import { SocketService } from 'src/app/Service/socket.service';


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
  ridestatus: Number = -1;
  

  
  constructor(
    private _ridehistroy: RidehistoryService, 
    private _confirmride: ConfirmrideService, 
    private _runningrequest: RunningrequestService,
    private _socket: SocketService,
    private papa: Papa,
    private dialog: MatDialog,
    private authService: authService_1.AuthService,
    ){}

  ngOnInit(){
    this.getRideHistory()
    this.aftercancelrideinrealtime()
    this.ridestatusupdates()
  }



  getRideHistory() {

    const filterdata = {
      "page": this.currentPage,
      "limit": this.limit,
      "payment": this.paymentmode,
      "fromdate": this.Fromdate,
      "todate": this.Todate,
      "status": this.ridestatus,
      "startlocationsearch": this.startlocation,
      "endlocationsearch": this.endlocation,
  }
  
    // console.log(filterdata);

    
    this._socket.emitridehistory(filterdata)

    this._socket.listenridehistory().subscribe((data: any) => {
      console.log(data);
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
    this.ridestatus = -1;
    this.paymentmode = '';
    this.startlocation = ''
    this.endlocation = ''
    this.Fromdate = ''
    this.Todate = ''


    this.getRideHistory()
  } 




  //----------------AFTER CANCEL RIDE IN REAL-TIME----------------//
  aftercancelrideinrealtime(){
    this._socket.listencancelride().subscribe((ridedata: any) => {
      this.getRideHistory()
    })
  }

  //----------------AFTER ACCEPT RIDE IN REAL-TIME----------------//
  ridestatusupdates(){
    this._socket.listeningrideupdates().subscribe((ridedata: any) => {
      this.getRideHistory()
    })
  }

  //----------------------DOWNLAOD RIDE-HISTORY DATA---------------------//
  downlaodallData() {
    const alldataatonce = {
      "payment": this.paymentmode,
      "fromdate": this.Fromdate,
      "todate": this.Todate,
      "status": this.ridestatus,
      "startlocationsearch": this.startlocation,
      "endlocationsearch": this.endlocation,
    };
    // console.log("150", this.ridestatus);
    
    // Make an API request to get the data
    this._ridehistroy.downlaodallData(alldataatonce).subscribe({
      next: (response: any) => {
        // console.log(response);
        const data = response.myridehistory;
        // console.log("156",data);
        
        // const username = data[0].userDetails?.username || '';
        // console.log(username);
        
        // const useremail = data.userDetails?.useremail || '';

        // Convert the data to CSV format using Papa.parse
        const csvData = this.convertToCSV(data);

        // Create a blob containing the CSV data
        const blob = new Blob([csvData], { type: 'text/csv' });

        // Generate a unique filename for the CSV file
        const fileName = 'data_' + new Date().getTime() + '.csv';

        // Trigger the file download by creating a link element
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      },
      error: (error: any) => {
        console.log(error.error.message);
      },
    });
  }

  convertToCSV(data: any[]) {
      const csvData = [
        ['Req. Id','Username', 'User Email', 'Start Location', 'End Location', 'Way Points', 'Ride Date', 'Ride Time', 'Time', 'Service Type', 'Payment Option', 'Estimate Time', 'Estimate Fare' , 'Ride Status']
      ];
    

      data.forEach(item => {
        const id = item._id
        const username = item.userDetails?.username || '';
        const useremail = item.userDetails?.useremail || '';
        const startLocation = item.startLocation || '';
        const endLocation = item.endLocation || '';
        const waypoints = item.wayPoints
        const rideDate = item.rideDate || '';
        const rideTime = item.rideTime || '';
        const time = item.time
        const servicetype = item.serviceType
        const paymentoption = item.paymentOption
        const estimateTime = item.estimateTime
        const estimateFare = item.estimateFare || '';
        const status = item.ridestatus || '';
      
        csvData.push([id, username, useremail, startLocation, endLocation, waypoints, rideDate, rideTime, time, servicetype, paymentoption, estimateTime, estimateFare, status]);
      });

    const csv = this.papa.unparse(csvData);
    return csv;
  }


    //--------------------------------------RIDE-HISTORY INFO DIALOG REF CODE---------------------------------------------//
    openInfoDialog(ride: any): void {
      // console.log(ride)
      const dialogConfig = new MatDialogConfig();
      
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true; 
      dialogConfig.width = '600px'; 
      dialogConfig.data = ride; 
      
      const dialogRef = this.dialog.open(RidehistorydialogComponent, dialogConfig);
      
    }

    // ---------------------------------------EXTRA COMMON CODE--------------------------------------------//
    resetTimer() {
      this.authService.resetInactivityTimer();
    }
}

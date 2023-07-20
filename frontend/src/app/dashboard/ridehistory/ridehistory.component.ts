import { Component, OnInit } from '@angular/core';
import { ConfirmrideService } from 'src/app/Service/confirmride.service';
import { RidehistoryService } from 'src/app/Service/ridehistory.service';
import { RunningrequestService } from 'src/app/Service/runningrequest.service';
import { Papa } from 'ngx-papaparse';

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
    private papa: Papa
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
  downlaodallData() {
    const alldataatonce = {
      "payment": this.paymentmode,
      "fromdate": this.Fromdate,
      "todate": this.Todate,
      "status": this.status,
      "startlocationsearch": this.startlocation,
      "endlocationsearch": this.endlocation,
    };

    // Make an API request to get the data
    this._ridehistroy.downlaodallData(alldataatonce).subscribe({
      next: (response: any) => {
        // console.log(response);
        const data = response.myridehistory;
        console.log(data);
        
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
        ['id','Username', 'User Email', 'Start Location', 'End Location', 'Way Points', 'Ride Date', 'Ride Time', 'Time', 'Service Type', 'Payment Option', 'Estimate Time', 'Estimate Fare' , 'Status']
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
        const status = item.status || '';
      
        csvData.push([id, username, useremail, startLocation, endLocation, waypoints, rideDate, rideTime, time, servicetype, paymentoption, estimateTime, estimateFare, status]);
      });

    const csv = this.papa.unparse(csvData);
    return csv;
  }
}

  // downloadDataAsCSV(){
  //   this.downlaodallData()
  // }
  // ... (existing code)











  // downlaodallData() {
  //   const alldataatonce = {
  //     "payment": this.paymentmode,
  //     "fromdate": this.Fromdate,
  //     "todate": this.Todate,
  //     "status": this.status,
  //     "startlocationsearch": this.startlocation,
  //     "endlocationsearch": this.endlocation,
  //   };
  
  //   this._ridehistroy.downlaodallData(alldataatonce).subscribe(
  //     (response: any) => {
  //       console.log(response.myridehistory);
  //       const data = response.myridehistory;
  
  //       if (!data || data.length === 0) {
  //         console.log('No data to convert.');
  //         return;
  //       }
  
  //       this.ngxCsvParser.parse(data, { header: false, delimiter: ',' }).pipe(
  //         catchError((error: NgxCSVParserError) => {
  //           console.log('Error during parsing:', error.message);
  //           return throwError('Error parsing CSV data.');
  //         })
  //       ).subscribe(
  //         (parsedData: any) => {
  //           console.log(parsedData);
  
  //           const csvData = this.convertToCSV(parsedData);
  //           console.log(csvData);
  
  //           this.downloadCSVFile(csvData); // Trigger the file download
  //         },
  //         (error: any) => {
  //           console.log('Error in parsing subscription:', error);
  //         }
  //       );
  //     },
  //     (error: any) => {
  //       console.log('Error in fetching data:', error.error.message);
  //     }
  //   );
  // }
  
  // convertToCSV(data: any[]) {
  //   // Define the CSV header with column names
  //   const csvHeader = 'ID,Payment Option,Ride Time,Service Type,Ride Date';
  
  //   // Convert each object to a CSV row
  //   const csvRows = data.map(item => {
  //     // Convert date object to string (if applicable)
  //     const rideDate = item.rideDate instanceof Date ? item.rideDate.toISOString() : item.rideDate;
  //     console.log(rideDate);
      
  //     const rowValues = [
  //       item._id,
  //       item.paymentOption,
  //       item.rideTime,
  //       item.serviceType,
  //       rideDate
  //     ];
  
  //     return rowValues.join(',');
  //   });
  
  //   // Combine the header and rows with newline characters to create the CSV content
  //   return csvHeader + '\n' + csvRows.join('\n');
  // }
  
  
  
  // downloadCSVFile(csvData: string) {
  //   // Create a blob containing the CSV data
  //   const blob = new Blob([csvData], { type: 'text/csv' });
  
  //   // Generate a unique filename for the CSV file
  //   const fileName = 'data_' + new Date().getTime() + '.csv';
  
  //   // Trigger the file download by creating a link element
  //   const link = document.createElement('a');
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = fileName;
  //   link.click();
  // }

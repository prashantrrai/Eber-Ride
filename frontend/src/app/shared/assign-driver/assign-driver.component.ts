import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DriverService } from 'src/app/Service/driver.service';
import { environment } from 'src/app/environment/environment';
import { MatIcon } from '@angular/material/icon';
import { ConfirmrideService } from 'src/app/Service/confirmride.service';
import { SocketService } from 'src/app/Service/socket.service';
import { RunningrequestComponent } from 'src/app/dashboard/runningrequest/runningrequest.component';
import { RunningrequestService } from 'src/app/Service/runningrequest.service';

@Component({
  selector: 'app-assign-driver',
  templateUrl: './assign-driver.component.html',
  styleUrls: ['./assign-driver.component.css']
})
export class AssignDriverComponent implements OnInit {
  baseUrl = environment.baseUrl
  dataArray: any[] = [];
  // assignedDrivers: any[] = [];
  driverArray: any[] = [];
  search!: string;
  currentPage!: number;
  limit!: number;
  selectedSortBy!: string;
  selectedSortOrder!: string;
  cityId: any;
  serviceId: any;
  rejectdriver:any;
  driver: any

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AssignDriverComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _socketService: SocketService,
    private  _runningRequestService: RunningrequestService
  ) { }


  ngOnInit(): void {
    this.getDriverData()
    this.assigndriverdata()
    this.gettingrejectrunningrequestdata();
    this.listenassignrejected()

    this.dataArray = this.data;
    // console.log(this.data);
    // console.log(this.dataArray)
  }

  // ---------------------------------------GET ASSIGNED DRIVER DATA USING SOCKET-----------------------------------------//
  getDriverData() {
    this.cityId = this.data.cityId;
    this.serviceId = this.data.serviceId;
    // console.log(this.cityId);
    // console.log(this.serviceId);
    
    
    this._socketService.getAssignedDriverData(this.cityId, this.serviceId)

    this._socketService.onUpdateStatusData().subscribe({
      next: (response) => {
        console.log(response);

        this._socketService.getAssignedDriverData(this.cityId, this.serviceId)

        this._socketService.onAssignedDriverData().subscribe((driverData) => {
          console.log(driverData);
          if (driverData) {

            this.driverArray = driverData;
            console.log(this.driverArray);

          } else {
            console.log('Error retrieving assigned driver data:', driverData);
          }
        });
      }
    })


    this._socketService.onAssignedDriverData().subscribe((driverData) => {
      // console.log(driverData);

      if (driverData) {

        this.driverArray = driverData;
        // console.log(this.driverArray);
        this.driver = driverData

      } else {
        console.log('Error retrieving assigned driver data:', driverData);
      }
    });


    // ------------------------UPDATE SERVICE DATA ON REAL TIME---------------------------//
    this._socketService.onUpdateServiceData().subscribe({
      next: (servicedata) => {
      // console.log(servicedata);
      this._socketService.getAssignedDriverData(this.cityId, this.serviceId)

      if (servicedata) {

        this.driverArray = servicedata;
        // console.log(this.driverArray);

      } else {
        console.log('Error retrieving assigned driver data:', servicedata);
      }
      }


    });

  }

  // --------------------------ASSIGN DRIVER FROM DIALOG REF BUTTON-----------------------//
  assigndriverdata(){
    this._socketService.onFinalassignedDriverData('data').subscribe({
      next: (response) => {
        // console.log("New Assigned Driver Details:    ",response);

        this._socketService.getAssignedDriverData(this.cityId, this.serviceId)
        // console.log(this.cityId, this.serviceId);
        

        this._socketService.onAssignedDriverData().subscribe((driverData) => {
          // console.log("Remaining Driver to Assign: ",driverData);
          this.driverArray = driverData;
        });
      }
    })
  }




  assignDriver(driver: any) {
    // console.log(driver);
    const alldata = {
      ridedata : this.data,
      driverdata : driver
     }

    this.dialogRef.close(alldata);
    // this.dialogRef.close(driver);
  }

  NearestDriver(driver: any) {
    this.data.nearest = true
    console.log(this.data.nearest);
    
    console.log(this.data);
    const alldata = {
      ridedata : this.data,
      driverdata : driver
     }
    console.log(alldata);
    

    this.dialogRef.close(alldata);
  }


  //--------------------(REJECT SINGLE)when data driver is free then that time this process run-----------------------//
  listenassignrejected(){
    this._socketService.listenassignrejected().subscribe((response: any)=> {

      this.getDriverData();
    }
  );
}

  //-----------------(REJECT NEAREST)when data driver is free then that time this process run---------------------//
  gettingrejectrunningrequestdata(){
    this._socketService.listenrejectRunningRequest().subscribe((response: any)=> {

      this.getDriverData();
    }
    );
  }

}

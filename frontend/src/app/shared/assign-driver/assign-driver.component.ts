import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DriverService } from 'src/app/Service/driver.service';
import { environment } from 'src/app/environment/environment';
import { MatIcon } from '@angular/material/icon';
import { ConfirmrideService } from 'src/app/Service/confirmride.service';
import { SocketService } from 'src/app/Service/socket.service';

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

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AssignDriverComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _socketService: SocketService

  ) { }


  ngOnInit(): void {
    this.getDriverData()


    this.dataArray = this.data;
    // console.log(this.data);
    // console.log(this.dataArray)
  }

  //--------------------------------------------GET DRIVER DATA FXN---------------------------------------------
  // getDriverData() {
  //   this._confirmride.getMatchedDriverdata({cityId: this.data.cityId, serviceId: this.data.serviceId }).subscribe({
  //     next: (response: any) => {
  //       console.log(response);
  //       this.driverArray = response;
  //       // console.log(this.driverArray);

  //     },
  //     error: (error: any) => {
  //       console.log(error);
  //     },
  //   });
  // }

  // ---------------------------------------GET ASSIGNED DRIVER DATA USING SOCKET-----------------------------------------//
  getDriverData() {
    const cityId = this.data.cityId;
    const serviceId = this.data.serviceId;

    this._socketService.getAssignedDriverData(cityId, serviceId)

    this._socketService.onUpdateStatusData().subscribe({
      next: (response) => {
        console.log(response);

        this._socketService.getAssignedDriverData(cityId, serviceId)
        
        this._socketService.onAssignedDriverData().subscribe((driverData) => {
          // console.log(driverData);

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
        console.log(this.driverArray);

      } else {
        console.log('Error retrieving assigned driver data:', driverData);
      }
    });
  }
}

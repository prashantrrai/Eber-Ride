import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmrideService } from './../../Service/confirmride.service';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/Service/auth.service';
import { InfoDialogComponent } from 'src/app/shared/info-dialog/info-dialog.component';
import { AssignDriverComponent } from 'src/app/shared/assign-driver/assign-driver.component';
import { SocketService } from 'src/app/Service/socket.service';
import { VehicleService } from 'src/app/Service/vehicle.service';

@Component({
  selector: 'app-confirmride',
  templateUrl: './confirmride.component.html',
  styleUrls: ['./confirmride.component.css']
})
export class ConfirmrideComponent {
  ridesArray: any[] =[]
  limit: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  count: any
  search: String = '';
  paginatedRideData: any[] = [];
  driverArray: any = [];
  rideStatus!: string; 
  assignedDriverName!: string;
  driverdataArray: any;
  driverId: any;
  rideId: any;
  statusfilter: Number = -1;
  vehiclefilter: String = '';
  filteredVehicles: string[] = [];
  searchText: any;
  searchDate: any;
  sortOrder: any = 'desc';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private _confirmride: ConfirmrideService,
    private dialog: MatDialog,
    private _socket: SocketService,
    private _vehicleservice: VehicleService
  ){}

  ngOnInit(): void{
    this.getrideData()
    this.getVehicle()
  }

  //-------------------------------------------- GET RIDE DATA with SEARCH, PAGINATION, FILTER   ---------------------------------------------
  getrideData() {
    this.search = this.searchText || this.searchDate;
    this._confirmride.getride(this.currentPage, this.limit, this.search, this.statusfilter , this.vehiclefilter, this.sortOrder).subscribe({
      next: (response: any) => {
        // console.log(response)
        this.ridesArray = response.rides;
        this.totalPages = response.totalPages;
        this.count = response.totalCount;

      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    console.log(this.limit);
    
    this.currentPage = 1;
    this.updatePaginatedDrivers();
    this.getrideData();
  }
  onPageChange(pageNumber: number) {
    console.log(pageNumber);
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginatedDrivers();
      this.getrideData();
      
    }
  }
  updatePaginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedRideData = this.ridesArray.slice(startIndex, endIndex);
  }


  //-----------------------------------GET VEHICLE ARRAY IN FILTER------------------------------//
  getVehicle(){
    this._vehicleservice.getvehicleData().subscribe(response => {
      // console.log(response);
      
      this.filteredVehicles = response.data.map((vehicle: any) => vehicle.vehicleName);
      // console.log(this.filteredVehicles);
      
    });
  }

  //-------------------------------------_FILTER DATA--------------------------------------//
  // applyFilter() {
  //   // console.log(this.statusfilter);
  //   // console.log(this.vehiclefilter)
  //   this._confirmride.getride(this.currentPage, this.limit, this.search, this.statusfilter, this.vehiclefilter).subscribe({
  //     next: (response: any) => {
  //       console.log(response);
        
  //     },
  //     error: (error: any) => {
  //       console.log(error);
        
  //     }

  //   })

  // }

  clearFilter() {
    this.statusfilter = -1;
    this.vehiclefilter = '';
    this.sortOrder = 'asc'

    this.getrideData()
  }


  //-----------------------SORTING ORDER OPTION----------------------//
  // sortingApply(value:any){
  //   console.log(value)
  //   this.getrideData()
  // }


  // -------------------------------------DELETE RIDE------------------------------------------//
  // deleteRide(rideid: string) {
  //   // console.log(rideid);

  //   const confirmation = confirm("Are you sure you want to delete this Ride?");
  //   if (confirmation) {
  //     this._confirmride.cancelride(rideid).subscribe({
  //       next: (response: any) => {
  //         // console.log(response);
  //         this.getrideData()
  //         this.toastr.success(response.message, "Success")
  //       },
  //       error: (error: any) => {
  //         console.log(error);
  //         this.toastr.error(error.statusText)
  //       }
  //     })
  //   }
  // }



  //--------------------------------------INFO DIALOG REF CODE---------------------------------------------//
  openInfoDialog(ride: any): void {
    // console.log(ride)
    const dialogConfig = new MatDialogConfig();
    
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true; 
    dialogConfig.width = '650px'; 
    dialogConfig.data = ride; 
    
    const dialogRef = this.dialog.open(InfoDialogComponent, dialogConfig);
    
  }
  
  //--------------------------------------ASSIGN DIALOG REF CODE---------------------------------------------//
  openAssignDriverDialog(ride: any): void {
    // console.log(ride);
    
    const dialogConfig = new MatDialogConfig();
    
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true; 
    dialogConfig.width = '1000px'; 
    dialogConfig.data = ride; 
    
    const dialogRef = this.dialog.open(AssignDriverComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((data: any) => {
    // console.log(data);
    this.driverdataArray = data
    // console.log("Assigned Driver Id:  ",this.driverdataArray.driverdata._id);  
    this.driverId = this.driverdataArray.driverdata._id
    this.rideId = this.driverdataArray.ridedata._id

    // console.log("Driver ID:",this.driverId,"RIDE ID:",this.rideId);
    //==========emit wala function=============
    this._socket.FinalassignedDriver(this.driverId  , this.rideId)

    });

  }
  

  //--------------------------------CANCEL RIDE------------------------------------------//
  cancelride(rideId: any){
    console.log(rideId);
    this._confirmride.emitcancelride('cancelride', rideId)

    this._confirmride.listencancelride('cancelridedata').subscribe((ridedata: any) => {
      console.log(ridedata);
      this.getrideData()
    })

  }



  // ---------------------------------------EXTRA COMMON CODE--------------------------------------------//
  resetTimer() {
    this.authService.resetInactivityTimer();
  }
  
}


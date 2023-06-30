import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmrideService } from './../../Service/confirmride.service';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/Service/auth.service';
import { InfoDialogComponent } from 'src/app/shared/info-dialog/info-dialog.component';
import { AssignDriverComponent } from 'src/app/shared/assign-driver/assign-driver.component';

@Component({
  selector: 'app-confirmride',
  templateUrl: './confirmride.component.html',
  styleUrls: ['./confirmride.component.css']
})
export class ConfirmrideComponent {
  ridesArray: any[] =[]
  limit: number = 3;
  currentPage: number = 1;
  totalPages: number = 0;
  count: any
  paginatedRideData: any[] = [];

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private _ride: ConfirmrideService,
    private dialog: MatDialog,
  ){}

  ngOnInit(): void{
    this.getrideData()
  }

  //-------------------------------------------- GET RIDE DATA ---------------------------------------------
  getrideData() {
    this._ride.getride().subscribe({
      next: (response: any) => {
        // console.log(response)
        this.ridesArray = response;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    this.currentPage = 1;
    this.updatePaginatedDrivers();
    this.getrideData();
  }
  onPageChange(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginatedDrivers();
      this.getrideData();
    }
  }
  // getPagesArray(): number[] {
  //   return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  // }
  updatePaginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedRideData = this.ridesArray.slice(startIndex, endIndex);
  }

  //--------------------------------------DIALOG REF CODE---------------------------------------------//
  openInfoDialog(ride: any): void {
    // console.log(ride)
    const dialogConfig = new MatDialogConfig();
    
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true; 
    dialogConfig.width = '650px'; 
    dialogConfig.data = ride; 
    
    const dialogRef = this.dialog.open(InfoDialogComponent, dialogConfig);
    
  }

  openAssignDriverDialog(ride: any): void {
    const dialogConfig = new MatDialogConfig();
    
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true; 
    dialogConfig.width = '1000px'; 
    dialogConfig.data = ride; 
    
    const dialogRef = this.dialog.open(AssignDriverComponent, dialogConfig);
    
  }
  
  // ---------------------------------------EXTRA COMMON CODE-----------------------------------------------------//
  resetTimer() {
    this.authService.resetInactivityTimer();
  }
  
}

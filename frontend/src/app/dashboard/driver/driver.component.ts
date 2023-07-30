import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/Service/auth.service';
import { DriverService } from 'src/app/Service/driver.service';
import { SocketService } from 'src/app/Service/socket.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent {
  driverForm!: FormGroup;
  driverFormButton: boolean = false;
  selectedcountrycode: any;
  countrycodeArray: any[] = [];
  isEditMode: boolean = false;
  citiesname: any[] = [];
  selectedCity: any;
  file: any;
  driverArray: any[] = [];
  limit: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedDrivers: any[] = [];
  id: any;
  search: string = '';
  serviceModal: boolean = false;
  vehiclesData: any
  serviceForm!: FormGroup;
  selectedVehicle: any;
  count: any;
  selectedSortBy: string = 'name';
  selectedSortOrder: string = 'desc';

  constructor(
    private _driver: DriverService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private socket: SocketService,
    private _socket: SocketService
  ) { }

  ngOnInit(): void {
    // this.getCountryCode()
    this.getcountryCode();
    this.getCityNamefromDB()
    this.getDriverData()
    this.getVehicleNamefromDB()
    this.getDriverStatus()
    this.getDriverService()
    

    this.driverForm = this.formBuilder.group({
      profile: [""],
      drivername: ["", [Validators.required]],
      driveremail: ["", [Validators.required, Validators.email]],
      countrycode: ["", [Validators.required]],
      driverphone: ["", [Validators.required, Validators.minLength(10)]],
      city: ["", [Validators.required]],
      status: [""],
    });

    this.serviceForm = this.formBuilder.group({
      servicetype: ['']
    });
  }

  // -----------------------GET COUNTRY CODE---------------------------
  // getCountryCode() {
  //   this._driver.getCountryCode().subscribe({
  //     next: (response) => {
  //       // console.log(response)
  //       let data = response.map((code: any) => {
  //         if (code.idd.suffixes) {
  //           let countrycode = code.idd.root + code.idd.suffixes[0];
  //           this.countrycodeArray.push(countrycode);
  //         }
  //       })
  //       this.countrycodeArray.sort();
  //     },
  //     error: (error: any) => {
  //       console.log(error);
  //     },
  //   });
  // }
  getcountryCode(){
    this._driver.getcode().subscribe({
      next: (response) => {
        // console.log(response)
        let code = response.countrydata.forEach((element: any) => {
          // console.log(element.countryCode)
          this.countrycodeArray.push(element.countryCode)
        });
        this.countrycodeArray.sort();
        // console.log(this.countrycodeArray)
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }
  onSelectedCode(value: any) {
    this.selectedcountrycode = value;
    // console.log(value)
  }

  
  // -----------------------GET CITY OPTION---------------------------
  getCityNamefromDB(): void {
    this._driver.getCityData().subscribe({
      next: (response) => {
        // console.log(response)
        this.citiesname = response.citydata;
      },
      error: (error) => {
        console.log(error.error.message);
      }
    });
  }
  onSelectedCity(value: any) {
    this.selectedCity = value;
    console.log(value)
  }

  // -----------------------DRIVER PROFILE---------------------------
  onFileSelected(event: any) {
    this.file = event.target.files[0];
    console.log(this.file);
  }
  
  // -------------------------------------------------NG SUBMIT FXN---------------------------------------------------------
  onSubmit() {
    if (this.isEditMode) {
      this.updateDriver();
    } else {
      this.AddDriver();
    }
  }

  // --------------------------------------------ADD DRIVER FXN---------------------------------------------
  AddDriver() {
    // using object but image not uploading
    const formValues = this.driverForm.value;
    console.log(formValues);

    // using formdata for image uploading
    var formData = new FormData();
    formData.append("drivername", this.driverForm.value.drivername);
    formData.append("driveremail", this.driverForm.value.driveremail);
    formData.append("countrycode", this.selectedcountrycode);
    formData.append("driverphone", this.driverForm.value.driverphone);
    formData.append("city", this.selectedCity);
    formData.append("profile", this.file);


    if (this.driverForm.valid) {
      this._driver.addDriver(formData).subscribe({
        next: (response: any) => {
          console.log(response);
          this.getDriverData();
          this.driverForm.reset();
          this.driverFormButton = false;
          this.file = null
          this.toastr.success(response.message);
        },
        error: (error: any) => {
          console.log(error.error.message);
          this.toastr.error(error.error.message);
        },
      });
    } else {
      this.toastr.warning("All Fields are Required");
    }
  }


  //--------------------------------------------GET DRIVER DATA FXN---------------------------------------------
  getDriverData() {
    this._driver.getDriver(this.search ,this.currentPage, this.limit, this.selectedSortBy, this.selectedSortOrder).subscribe({
      next: (response: any) => {
        this.driverArray = response.driverdata;
        this.totalPages = response.totalPage;
        this.count = response.count;
        
        this.updatePaginatedDrivers();
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
    this.getDriverData();
  }
  onPageChange(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginatedDrivers();
      this.getDriverData();
    }
  }
  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }
  updatePaginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedDrivers = this.driverArray.slice(startIndex, endIndex);
  }

  // --------------------------------------------DELETE DRIVER DATA FXN---------------------------------------------
  deleteDriver(driverId: string): void {
    console.log(driverId)
    const confirmation = confirm("Are you sure you want to delete this Driver?");

    if (confirmation) {
      this._driver.deleteDriver(driverId).subscribe({
        next: (response: any) => {
          console.log(response)
          this.getDriverData();
          this.toastr.success(response.message);
        },
        error: (error: any) => {
          console.log(error.error.message);
          this.toastr.error(error.error.message);
        },
      });
    }
  }

  //---------------------------------------EDIT BUTTON-------------------------------------------------------
  editbtn(driver: any): void {
    this.isEditMode = true;
    this.id = driver._id;
    console.log(driver)
    this.driverFormButton = true;


    this.driverForm.patchValue({
      drivername: driver.drivername,
      driveremail: driver.driveremail,
      countrycode: driver.countrycode,
      city: driver.city,
      driverphone: driver.driverphone,
      status: driver.status
    });
    // console.log(this.driverUpdateForm.value)
    // console.log(this.file);
  }
  updateCancel() {
    this.driverFormButton = !this.driverFormButton;
  }
 //-------------------------------------------------------------UPDATE DRIVER FXN-------------------------------------------------------
 updateDriver(){
  const updatedData = this.driverForm.value;
  console.log(updatedData);

  const formdata = new FormData();
  formdata.append("drivername", updatedData.drivername);
  formdata.append("driveremail", updatedData.driveremail);
  formdata.append("countrycode", updatedData.countrycode);
  formdata.append("driverphone", updatedData.driverphone);
  formdata.append("city", updatedData.city);
  formdata.append("profile", this.file);
  

  this._driver.updateDriver(this.id, formdata).subscribe({
    next: (response: any) => {
      console.log(response.updatedDriver);
      this.driverArray.push(response.updatedDriver);
      this.getDriverData();
      this.driverForm.reset();
      this.driverFormButton = false;
      this.file = null
      this.toastr.success(response.message);
    },
    error: (error: any) => {
      console.log(error);
      this.toastr.error(error.error.message);
    },
  });
}

  // ---------------------------------------------------DRIVER STATUS FXN--------------------------------------------------
  driverStatus(driver: any) {
    this.id = driver._id;
    const status = !driver.status;
    // console.log(driver._id);
    // console.log(status)
    
  
    // const data = {updatedriverstatus: driver.status}
    // console.log(data)

    // const formdata = new FormData();
    // formdata.append("updatedriverstatus", String(status));
  
    // ----------------------------Without Socket.IO----------------------------//
  //   this._driver.updateStatus(this.id, status).subscribe({
  //     next: (response: any) => {
  //       console.log(response);
  //       this.driverArray.push(response.status)
  //       this.getDriverData();
  //       this.toastr.success(response.message,  'Success')
  //     },
  //     error: (error: any) => {
  //       console.error(error);
  //       this.toastr.error(error.error.message)
  //     }
  //   });
  //   driver.status = status; // Update the driver's status in the UI
  // }

  this._socket.updatedriverStatus(this.id, status);
}


  // ----------------------------DRIVER STATUS With Socket.IO----------------------------//
  getDriverStatus(){
    
    this._socket.onUpdateStatusData().subscribe({
      next: (response) => {
        // console.log(response);
        
        this.driverArray = response;
        this.getDriverData();
        this.toastr.success(response.message,  'Success');
      },
    error: (error: any) => {
        console.log(error);
        this.toastr.error(error.error.message)
      }
  })
  }

  //-----------------------------------------GET VEHICLE DATA FROM DB-----------------------------------------------
  getVehicleNamefromDB(){
    this._driver.getVehicleData().subscribe({
      next: (response) => {
        this.vehiclesData = response.data;
      },
      error: (error) => {
        console.log(error.error.message);
      }
    });
  }
  onSelectedVehicle(vehicle: string): void {
    this.selectedVehicle = vehicle
    // console.log(vehicle)
  }

  // -------------------------------------------------SERVICE FXN------------------------------------------------
  onserviceType(driver: any){
    this.driverFormButton = false
    this.serviceModal = true;

    // console.log(driver);
    
    this.id = driver._id
    this.serviceForm.patchValue({
      servicetype: driver.servicetype
    });
  }

  
  // -----------------------------------------------------UPDATE SERVICE FXN-----------------------------------------------
  updateService(): void {
    const data = this.serviceForm.value.servicetype
    console.log(data)

    // if (this.serviceForm.valid) {


    //   this._driver.updateService(this.id, data).subscribe({
    //     next: (response: any) => {
    //       console.log(response);
    //       // this.driverArray.push(response);
    //       this.getDriverData()
    //       this.serviceModal = false;
    //       this.serviceForm.reset();
    //       this.toastr.success(response.message)

    //     },
    //     error: (error: any) => {
    //       console.error(error);
    //       this.toastr.error(error.error)

    //     }
    //   });
    // }
    this._socket.updatedriverService(this.id, data);
  }

    // ----------------------------DRIVER SERVICE With Socket.IO----------------------------//
    getDriverService(){
    
      this._socket.onUpdateServiceData().subscribe({
        next: (response) => {
          // console.log(response);
          this.getDriverData()
          this.serviceModal = false;
          this.serviceForm.reset();
          this.toastr.success(response.message,  'Success');
        },
      error: (error: any) => {
          console.log(error);
          this.toastr.error(error.error.message)
        }
    })
    }


  
  // ----------------------------------------BUTTONS CONTROL PANEL---------------------------------------------
  toggleFormVisibility() {
    this.driverFormButton = !this.driverFormButton;
    this.isEditMode = false;
    this.driverForm.reset()
    this.driverForm.patchValue({
      countrycode:'',
      city:'',
    });
  }
  closeModal(): void {
    this.serviceModal = false;
    this.serviceForm.reset();
  }
  
  CancelForm(){
    this.driverFormButton = false;
    this.isEditMode = false;
    this.driverForm.reset()
    this.driverForm.patchValue({
      countrycode:'',
      city:'',
    });
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }

}
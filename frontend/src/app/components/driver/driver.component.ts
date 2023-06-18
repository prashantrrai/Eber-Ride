import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/Service/auth.service';
import { DriverService } from 'src/app/Service/driver.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent {

  showButton: boolean = true;
  driverUpdateForm!: FormGroup;
  AddForm!: FormGroup;
  AddbuttonForm: boolean = false;
  updateForm: boolean = false;
  countrycode: any[] = [];
  citiesname: any[] = [];
  vehiclesname: any[] = []
  vehiclesimage: any;
  file: any;
  selectedCC: any;
  selectedCity: any;
  selectedVehicle: any;
  id: any;
  count: any;
  
  searchValue: string = '';
  
  driverArray: any[] = [];
  paginatedDrivers: any[] = [];
  limit: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  lvl2master: any
  serviceForm!: FormGroup;
  serviceModal: boolean = false;
  vehiclesData: any

  constructor(
    private _driver: DriverService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getDriverData();
    this.fetchCountryDataAPI();
    this.getCityNamefromDB()
    this.getVehicleNamefromDB()

    this.AddForm = this.formBuilder.group({
      profile: [""],
      drivername: ["", [Validators.required]],
      driveremail: ["", [Validators.required, Validators.email]],
      driverphone: ["", [Validators.required, Validators.minLength(10)]],
      city: [""],
    });

    this.driverUpdateForm = this.formBuilder.group({
      updatedrivername: ["", [Validators.required]],
      updatedriveremail: ["", [Validators.required, Validators.email]],
      updatedcountrycode: [""],
      updatedriverphone: ["", [Validators.required, Validators.minLength(10)]],
      updatedcity: [""],
      updatedriverstatus: [""]
    });

    this.serviceForm = this.formBuilder.group({
      servicename: [''] // Set the default value here
    });


  }


  getDriverData() {
    this._driver.getDriver(this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        // console.log(response)
        this.driverArray = response.driverdata;
        this.totalPages = response.totalPages;
        this.updatePaginatedDrivers();
      },
      error: (error: any) => {
        console.log(error.error.message);
        alert(error.error.message);
      },
    });
  }

  updatePaginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedDrivers = this.driverArray.slice(startIndex, endIndex);
  }


  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value); // Parse the limit value as an integer

    // Reset the current page to 1 when the limit changes
    this.currentPage = 1;

    // Update the paginatedDrivers array based on the new limit and current page
    this.updatePaginatedDrivers();
    this.getDriverData();
  }

  onPageChange(pageNumber: number) {
    // Validate the new page number
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;

    // Update the paginatedDrivers array based on the new page
    this.updatePaginatedDrivers();
    this.getDriverData();
    }
  }


  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }


  fetchCountryDataAPI(): void {
    this._driver.fetchCountryAPI().subscribe({
      next: (countries) => {
        countries.forEach((code: any) => {
          if (code.idd.suffixes) {
            let cc = code.idd.root + code.idd.suffixes[0];
            this.countrycode.push(cc);
          }
        });
        this.countrycode.sort();
        // console.log(this.countrycode)
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }
  
  onSelectedCode(value: any) {
    this.selectedCC = value;
    console.log(value)
  }
  

    // To fetch country data from from /countrydata API in dropdown..........
    getCityNamefromDB(): void {
      this._driver.getCityData().subscribe({
        next: (response) => {
          // console.log(response);
          const cityNames = response.map((obj: any) => obj.city);
          // console.log(cityNames);
          this.citiesname = cityNames; // Assigning the city names to the `citiesname` property
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

  
    // To fetch country data from from /countrydata API in dropdown..........
    getVehicleNamefromDB(): void {
      this._driver.getVehicleData().subscribe({
        next: (response) => {
          // console.log(response);
          // const vehicleName = response.data.map((obj: any) => obj.vehicleName);
          // const vehicleImage = response.data.map((obj: any) => obj.vehicleImage);
          this.vehiclesData = response.data.map((vehicle: any) => ({
            _id: vehicle._id,
            vehicleName: vehicle.vehicleName,
            // vehicleImage: vehicle.vehicleImage,
          }));
          // console.log(this.vehiclesData);

          // this.vehiclesname = vehicleName;
          // this.vehiclesimage = vehicleImage
          // console.log(vehicleName, vehicleImage);
        },
        error: (error) => {
          console.log(error.error.message);
        }
      });
    }


  onFileSelected(event: any) {
    this.file = event.target.files[0];
    // console.log(this.file);
  }

  AddDriver() {
    var formData = new FormData();
    formData.append("profile", this.file);
    formData.append("drivername", this.AddForm.value.drivername);
    formData.append("driveremail", this.AddForm.value.driveremail);
    formData.append("countrycode", this.selectedCC);
    formData.append("city", this.selectedCity);
    formData.append("driverphone", this.AddForm.value.driverphone);

    if (this.AddForm.valid) {
      this._driver.addDriver(formData).subscribe({
        next: (resp: any) => {
          console.log(resp)
          this.driverArray.push(resp.newDriver);
          this.AddForm.reset();
          this.AddbuttonForm = false;
          this.getDriverData();
          this.toastr.success(resp.message);
        },
        error: (error: any) => {
          console.log(error.error.message);
          this.toastr.error(error.message);
        },
      });
    } else {
      this.toastr.warning("All Fields are Required");
    }
  }

  deleteDriver(driverId: string): void {
    console.log(driverId)
    const confirmation = confirm("Are you sure you want to delete this Driver?");

    if (confirmation) {
      this._driver.deleteDriver(driverId).subscribe({
        next: (response: any) => {
          console.log(response)
          this.driverArray.push(response.newDriver);
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
    this.id = driver._id;
    // console.log(this.id)
    // console.log(driver._id)
    // console.log(driver)
    // console.log(driver.city)
    // console.log(driver.countrycode)
    this.updateForm = true;
    this.AddbuttonForm = false

    this.driverUpdateForm.patchValue({
      updatedrivername: driver.drivername,
      updatedriveremail: driver.driveremail,
      updatedcountrycode: driver.countrycode,
      updatedcity: driver.city,
      updatedriverphone: driver.driverphone,
      updatedriverstatus: driver.status
    });
    // console.log(this.driverUpdateForm.value)
    // console.log(this.file);
  }

  //----------------------------------UPDATE DRIVER FXN---------------------------------------------
  updateDriver(): void {
    const updatedData = this.driverUpdateForm.value;
    console.log(updatedData);

    const formdata = new FormData();
    formdata.append("profile", this.file);
    formdata.append("updatedrivername", updatedData.updatedrivername);
    formdata.append("updatedriveremail", updatedData.updatedriveremail);
    formdata.append("updatedcountrycode", updatedData.updatedcountrycode);
    formdata.append("updatedcity", updatedData.updatedcity);
    formdata.append("updatedriverphone", updatedData.updatedriverphone);
    

    this._driver.updateDriver(this.id, formdata).subscribe({
      next: (response: any) => {
        console.log(response.updatedDriver);
        this.driverArray.push(response.updatedDriver);
        this.getDriverData();
        this.driverUpdateForm.reset();
        this.file = null
        this.updateForm = !this.updateForm;
        this.toastr.success(response.message);
      },
      error: (error: any) => {
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }



  searchDriver() {
    this.currentPage = 1; // Reset the current page to 1 when searching
    console.log(this.searchValue)
    this._driver.searchDriver(this.searchValue, this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        console.log(response)
        this.driverArray = response.driverdata;
        this.totalPages = response.totalPages;
        this.updatePaginatedDrivers(); // Update paginatedUsers array based on search results
      },
      error: (error: any) => {
        console.log(error.error.message);
      }
  });
  }
  
  updateCancel() {
    this.updateForm = !this.updateForm;
  }

  driverStatus(driver: any) {
    this.id = driver._id;
    const status = !driver.status;
    console.log(status)
  
    // const data = {updatedriverstatus: driver.status}
    // console.log(data)

    // const formdata = new FormData();
    // formdata.append("updatedriverstatus", String(status));
  
    this._driver.updateStatus(this.id, status).subscribe({
      next: (response: any) => {
        console.log(response);
        this.driverArray.push(response.status)
        this.getDriverData();
        this.toastr.success(response.message,  'Success')
      },
      error: (error: any) => {
        console.error(error);
        this.toastr.error(error.error.message)
      }
    });
    driver.status = status; // Update the driver's status in the UI
  }


  
  onserviceType(driver: any){
    this.updateForm = false;
    this.AddbuttonForm = false
    this.serviceModal = true;

    this.id = driver._id

    console.log(driver.servicetype)

    this.serviceForm.patchValue({
      servicename: driver.servicetype
    });
    console.log(this.id)
  }


  onSelectedVehicle(vehicle: string): void {
    this.selectedVehicle = vehicle
    // console.log(this.selectedVehicle)
    // console.log(this.serviceForm.value.servicename)
  }
  
  updateService(): void {
    if (this.serviceForm.valid) {
      // const servicename = this.serviceForm.value.servicename;
      // console.log(this.serviceForm.value.servicename)

      const data = {servicename:this.serviceForm.value.servicename}
      console.log(data)

      this._driver.updateService(this.id, data).subscribe({
        next: (response: any) => {
          console.log(response);
          // this.driverArray.push(response);
          // this.getDriverData()
          this.serviceModal = false;
          this.serviceForm.reset();
          this.toastr.success(response.message)

        },
        error: (error: any) => {
          console.error(error);
          this.toastr.error(error.error.message)

        }
      });
    }
  }
  
  closeModal(): void {
    this.serviceModal = false;
    this.serviceForm.reset();
  }
  

  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
    this.updateForm = false
    this.showButton = false;
  }
  CancelForm(){
    this.AddbuttonForm = false;
    this.showButton = true;
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}

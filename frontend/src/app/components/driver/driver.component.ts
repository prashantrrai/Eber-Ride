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
  // selectedCountryCode: string = "+1";
  // phoneNumber: string = "";
  
  // // Access the selected country code and phone number in your code as needed
  // // For example, you can combine the country code and phone number using a computed property
  // getFormattedPhoneNumber(): string {
  //   return this.selectedCountryCode + this.phoneNumber;
  // }


  driverUpdateForm!: FormGroup;
  AddForm!: FormGroup;
  AddbuttonForm: boolean = false;
  updateForm: boolean = false;
  driverArray: any[] = [];
  countrycode: any[] = [];
  file: any;
  selectedCC: any;
  id: any;
  count: any;

  searchValue: string = '';

  limit: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedDrivers: any[] = [];

  constructor(
    private _driver: DriverService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getDriverData();
    this.fetchCountryDataAPI();

    this.AddForm = this.formBuilder.group({
      profile: [""],
      drivername: ["", [Validators.required]],
      driveremail: ["", [Validators.required, Validators.email]],
      driverphone: ["", [Validators.required, Validators.minLength(10)]],
    });

    this.driverUpdateForm = this.formBuilder.group({
      updatedrivername: ["", [Validators.required]],
      updatedriveremail: ["", [Validators.required, Validators.email]],
      updatecountrycode: [""],
      updatedriverphone: ["", [Validators.required, Validators.minLength(10)]],
    });
  }


  getDriverData() {
    this._driver.getDriver(this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        // console.log(response)
        this.driverArray = response.driverdata;
        // console.log(response.driverdata)
        this.totalPages = response.totalPages;
      },
      error: (error: any) => {
        console.log(error.error.message);
        alert(error.error.message);
      },
    });
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

  updatePaginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;

    this.paginatedDrivers = this.driverArray.slice(startIndex, endIndex);
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
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  onSelected(value: any) {
    this.selectedCC = value;
    // console.log(value)
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
    formData.append("driverphone", this.AddForm.value.driverphone);

    if (this.AddForm.valid) {
      this._driver.addDriver(formData).subscribe({
        next: (resp: any) => {
          // console.log(resp)
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
    const confirmation = confirm("Are you sure you want to delete this user?");

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

  updateBtnClick(driver: any): void {
    this.id = driver._id;
    this.updateForm = true;
    // console.log(driver._id)
    // console.log(driver)
    this.driverUpdateForm.patchValue({
      updatedrivername: driver.drivername,
      updatedriveremail: driver.driveremail,
      updatecountrycode: driver.countrycode,
      updatedriverphone: driver.driverphone,
    });
    // console.log(this.driverUpdateForm.value)
  }

  updateDriver(): void {
    const updatedData = this.driverUpdateForm.value;
    var formdata = new FormData();
    formdata.append("profile", this.file);
    formdata.append("updatedrivername", updatedData.updatedrivername);
    formdata.append("updatedriveremail", updatedData.updatedriveremail);
    formdata.append("updatecountrycode", updatedData.updatecountrycode);
    formdata.append("updatedriverphone", updatedData.updatedriverphone);
    console.log(formdata);


    this._driver.updateDriver(this.id, formdata).subscribe({
      next: (response: any) => {
        console.log(response);
        this.driverArray.push(response.updatedDriver);
        this.getDriverData();
        this.driverUpdateForm.reset();
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
    // console.log(this.searchValue)
    this._driver.searchDriver(this.searchValue, this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        this.driverArray = response.driverdata;
        this.totalPages = response.totalPages;
      },
      error: (error: any) => {
        console.log(error.error.message);
        alert(error.error.message);
      }
  });
  }
  
  updateCancel() {
    this.updateForm = !this.updateForm;
  }
  

  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}

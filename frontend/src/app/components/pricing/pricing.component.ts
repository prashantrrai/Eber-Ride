import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/Service/auth.service";
import { PricingService } from "src/app/Service/pricing.service";

@Component({
  selector: "app-pricing",
  templateUrl: "./pricing.component.html",
  styleUrls: ["./pricing.component.css"],
})
export class PricingComponent {
  showButton: boolean = true;
  addForm: boolean = false;
  pricingForm!: FormGroup;
  isEditMode: boolean = false;
  selectedCity: any;
  selectedCountry: any;
  citiesname: any[] = [];
  countriesname: any[] = [];
  country_id: any;
  serviceData: any[] = [];
  selectedVehicle: any;
  distbasePriceArray: number[] = [1, 2, 3, 4];
  selectedDistance!: number;
  valueArray: any[] = [];
  id: any;
  limit: number = 3;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedData: any[] = [];
  searchValue: string = '';

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private _pricing: PricingService
  ) {}

  ngOnInit(): void {
    this.getCountry();
    this.getCity();
    this.getService();
    this.getPricingData();

    this.pricingForm = this.formBuilder.group({
      country: [""],
      city: [""],
      service: [""],
      driverprofit: ["", [Validators.required]],
      minfare: ["", [Validators.required]],
      distancebaseprice: [""],
      baseprice: ["", [Validators.required]],
      ppudist: ["", [Validators.required]],
      pputime: ["", [Validators.required]],
      maxspace: ["", [Validators.required]],
    });
  }

  // ----------------GET COUNTRY DATA---------------
  getCountry(): void {
    this._pricing.getCountryData().subscribe({
      next: (response) => {
        // console.log(response)
        // const country_id = response.countrydata.map((obj: any) => obj._id);
        // this.country_id = country_id
        const country = response.countrydata.map((obj: any) => obj.countryName);
        this.countriesname = country;
      },
      error: (error) => {
        console.log(error.error.message);
      },
    });
  }
  onSelectedCountry(value: any) {
    this.selectedCountry = value;
    // console.log(value)
    this.getCity();
  }

  // -----------------GET CITY DATA---------------
  getCity(): void {
    this._pricing.getCityData().subscribe({
      next: (response) => {
        // const city = response.map((obj: any) => obj.city);
        // const countrywaladata = response.map((obj: any) => obj.countryDetails.countryName);
        // console.log(countrywaladata)
        const countrywaladata = response.filter(
          (obj: any) => obj.countryDetails.countryName === this.selectedCountry
        );
        const city = countrywaladata.map((obj: any) => obj.city);
        this.citiesname = city;
      },
      error: (error) => {
        console.log(error.error.message);
      },
    });
  }
  onSelectedCity(city: any) {
    this.selectedCity = city;
    // var newArray= this.serviceData.filter((obj: any) => {
    //   return(
    //     this.pricingForm.value.city === obj.city
    //   )
    // });
    console.log(city);
  }

  // -----------------GET SERVICE DATA---------------
  getService(): void {
    this._pricing.getServiceData().subscribe({
      next: (response) => {
        console.log(this.valueArray);
        const service = response.data.map((obj: any) => obj.vehicleName);
        this.serviceData = service;
      },
      error: (error) => {
        console.log(error.error.message);
      },
    });
  }
  onSelectedVehicle(service: any): void {
    this.selectedVehicle = service;
    const value = this.valueArray.filter((obj: any) => {
      return (
        this.pricingForm.value.country === obj.country &&
        this.pricingForm.value.city === obj.city &&
        this.pricingForm.value.service === obj.service
      )
    });
    console.log(value);
    if(value.length > 0){
      this.toastr.warning("This CarService Already Exist in This CIty");
    }
    // console.log(service);
  }

  // -----------------Disatnce Base Price DATA---------------
  onSelectDistance(distance: number) {
    this.selectedDistance = distance;
    // console.log(service);
  }

  // --------------------------------------------NG SUBMIT FXN-----------------------------------------------------
  onSubmit() {
    if (this.isEditMode) {
      this.UpdatePricing();
    } else {
      this.AddPricing();
    }
  }

  // --------------------------------------------ADD VEHICLE PRICING FXN---------------------------------------------
  AddPricing() {
    const formValues = this.pricingForm.value;
    // console.log(formValues);

    if (this.pricingForm.valid) {
      this._pricing.addPricing(formValues).subscribe({
        next: (response: any) => {
          console.log(response);
          this.valueArray.push(response.pricingData);
          this.getPricingData();
          this.pricingForm.reset();
          this.addForm = false;
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

  // --------------------------------------------GET VEHICLE PRICING DATA FXN---------------------------------------------
  getPricingData() {
    this._pricing.getPricingData(this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        console.log(response);
        const data = response.pricingData.map((obj: any) => obj);
        this.valueArray = data;
        this.totalPages = response.totalPages;
        this.updatePaginatedPrices();
      },
      error: (error: any) => {
        console.log(error.error.message);
      },
    });
  }

  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value); // Parse the limit value as an integer

    // Reset the current page to 1 when the limit changes
    this.currentPage = 1;

    // Update the paginatedDrivers array based on the new limit and current page
    this.updatePaginatedPrices();
    this.getPricingData();
  }
  onPageChange(pageNumber: number) {
    // Validate the new page number
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;

    // Update the paginatedDrivers array based on the new page
    this.updatePaginatedPrices();
    this.getPricingData();
    }
  }
  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }
  updatePaginatedPrices() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedData = this.valueArray.slice(startIndex, endIndex);
  }

  searchDriver() {
    this.currentPage = 1; // Reset the current page to 1 when searching
    // console.log(this.searchValue)
    this._pricing.searchPrice(this.searchValue, this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        console.log(response)
        this.valueArray = response.pricingdata;
        this.totalPages = response.totalPages;
        this.updatePaginatedPrices(); // Update paginatedUsers array based on search results
      },
      error: (error: any) => {
        console.log(error);
      }
  });
  }

  // --------------------------------------------DELETE VEHICLE PRICING FXN---------------------------------------------
  deleteValues(id: any) {
    console.log(id);
    const confirmation = confirm("Are you sure you want to Delete?");

    if (confirmation) {
      this._pricing.deleteValues(id).subscribe({
        next: (response: any) => {
          console.log(response);
          this.getPricingData();
          this.toastr.success(response.message);
        },
        error: (error: any) => {
          console.log(error.error.message);
          this.toastr.error(error.error.message);
        },
      });
    }
  }

  // --------------------------------------------UPDATE VEHICLE PRICING FXN---------------------------------------------
  editbtn(values: any) {
    this.isEditMode = true;
    this.addForm = true;

    this.id = values._id;
    // console.log("price id:",this.id)

    this.pricingForm.patchValue({
      country: values.country,
      city: values.city,
      service: values.service,
      driverprofit: values.driverprofit,
      minfare: values.minfare,
      distancebaseprice: values.distancebaseprice,
      baseprice: values.baseprice,
      ppudist: values.ppudist,
      pputime: values.pputime,
      maxspace: values.maxspace,
    });
    // console.log(this.pricingForm.value)
  }

  UpdatePricing() {
    const data = this.pricingForm.value;

    this._pricing.UpdatePricing(this.id, data).subscribe({
      next: (response: any) => {
        console.log(response);
        this.valueArray.push(response.pricingData);
        this.getPricingData();
        this.pricingForm.reset();
        this.addForm = false;
        this.toastr.success(response.message);
      },
      error: (error: any) => {
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }


  // ----------------------------------------BUTTONS CONTROL PANEL---------------------------------------------
  toggleFormVisibility() {
    // this.addForm = !this.addForm;
    this.addForm = true;
    this.showButton = false;
    this.isEditMode = false;
  }
  CancelForm() {
    this.addForm = false;
    this.showButton = true;
    this.isEditMode = false;
    this.pricingForm.reset();
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}

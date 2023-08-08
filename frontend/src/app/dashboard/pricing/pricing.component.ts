import { ChangeDetectorRef, Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/Service/auth.service";
import { PricingService } from "src/app/Service/pricing.service";
import { NgxSpinnerService } from 'ngx-spinner';

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
  countriesname: any[] = [];
  citiesname: any[] = [];
  serviceData: any[] = [];
  distbasePriceArray: number[] = [1, 2, 3, 4];
  selectedDistance!: number;
  selectedCountry: any;
  selectedCity: any;
  selectedVehicle: any;
  valueArray: any[] = [];
  searchValue: string = '';
  limit: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedData: any[] = [];
  id: any;

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private _pricing: PricingService,
    private spinner: NgxSpinnerService,
    private cd : ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCountry()
    this.searchPrice();

    this.pricingForm = this.formBuilder.group({
      country: ["", [Validators.required]],
      city: ["", [Validators.required]],
      service: ["", [Validators.required]],
      driverprofit: ["", [Validators.required]],
      minfare: ["", [Validators.required]],
      distancebaseprice: ["", [Validators.required]],
      baseprice: ["", [Validators.required]],
      ppudist: ["", [Validators.required]],
      pputime: ["", [Validators.required]],
      maxspace: ["", [Validators.required]],
    });
  }


  getCountry(): void {
    this._pricing.getCountryData().subscribe({
      next: (response) => {
        this.countriesname = response.countrydata;
      },
      error: (error) => {
        console.log(error.error.message);
      },
    });
  }
  onSelectedCountry(value: any) {
    this.selectedCountry = value;
    this.getCity();
    // console.log(value)
  }

  // -----------------GET CITY DATA---------------
  getCity(): void {
    this._pricing.getCityData().subscribe({
      next: (response: any) => {
        console.log(response)
        const filteredCities = response.citydata.filter((city: any) => city.countryDetails._id === this.selectedCountry);
        console.log(filteredCities)
        this.citiesname=[]
        this.citiesname = filteredCities;
        this.getService()
      },
      error: (error) => {
        console.log(error.error.message);
      },
    });
  }
  onSelectedCity(city: any) {
    this.selectedCity = city;
    console.log(city);
    this.getService() 
  }

  // -----------------GET SERVICE DATA---------------
  getService(): void {
    this._pricing.getServiceData({city:this.selectedCity, country: this.selectedCountry}).subscribe({
      next: (response) => {
        this.serviceData = response.data;
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
    console.log(this.valueArray)
    console.log(this.pricingForm.value.country)
    console.log(value);
    if(value.length > 0){
      this.toastr.warning("This CarService Already Exist in This CIty");
    }
    // console.log(service);
  }

  // -----------------Distance Base Price DATA---------------
  onSelectDistance(distance: number) {
    this.selectedDistance = distance;
    console.log(distance);
  }
  
  // -------------------------------------------------NG SUBMIT FXN---------------------------------------------------------
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
          this.searchPrice();
          this.pricingForm.reset();
          this.addForm = false;
          this.toastr.success(response.message);
        },
        error: (error: any) => {
          console.log(error.error.message);
          this.toastr.warning(error.message);
        },
      });
    } else {
      this.toastr.warning("All Fields are Required");
    }
  }

  //--------------------------------------------GET VEHICLE PRICING DATA FXN---------------------------------------------
  searchPrice() {
    this._pricing.getPricingData(this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        console.log(response)
        this.valueArray = response.pricingdata;
        this.totalPages = response.totalPage;
        this.updatePaginatedPrices();
      },
      error: (error: any) => {
        console.log(error.message);
      }
  });
  }
  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    this.currentPage = 1;
    // Update the paginatedDrivers array based on the new limit and current page
    this.updatePaginatedPrices();
    this.searchPrice();
  }
  onPageChange(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      console.log(pageNumber)
    // Update the paginatedDrivers array based on the new page
    // this.updatePaginatedPrices();
    this.searchPrice();
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
  // --------------------------------------------DELETE VEHICLE PRICING FXN---------------------------------------------
  deleteValues(id: any) {
    console.log(id);
    const confirmation = confirm("Are you sure you want to Delete?");

    if (confirmation) {
      this._pricing.deleteValues(id).subscribe({
        next: (response: any) => {
          console.log(response);
          this.searchPrice();
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

    // console.log(values);
    this.id = values._id;
    // console.log("231",this.valueArray)
    // this.onSelectedCountry(values.country)

    // this.spinner.show();
    // console.log("values",values.city);
    
    this.pricingForm.patchValue({
      country: values.countryDetails.countryName,
      city: values.cityDetails.city,
      service:values.serviceDetails.vehicleName,
      driverprofit: values.driverprofit,
      minfare: values.minfare,
      distancebaseprice: values.distancebaseprice,
      baseprice: values.baseprice,
      ppudist: values.ppudist,
      pputime: values.pputime,
      maxspace: values.maxspace,
    });
      this.cd.detectChanges()



    // setTimeout(() => {
    //   this.pricingForm.patchValue({
    //     city: values.city,    
    //   });
    // }, 0);

    // setTimeout(() => {
    //   this.pricingForm.patchValue({
    //     service: values.service,
    //   });
    //   this.cd.detectChanges()
    //   this.spinner.hide();
    // }, 0);

  }

  UpdatePricing() {
    const data = {
      driverprofit: this.pricingForm.value.driverprofit,
      minfare: this.pricingForm.value.minfare,
      distancebaseprice: this.pricingForm.value.distancebaseprice,
      baseprice: this.pricingForm.value.baseprice,
      ppudist: this.pricingForm.value.ppudist,
      pputime: this.pricingForm.value.pputime,
      maxspace: this.pricingForm.value.maxspace,
    }
    console.log(data);
    

    this._pricing.UpdatePricing(this.id, data).subscribe({
      next: (response: any) => {
        console.log(response);
        this.valueArray.push(response.pricingData);
        this.searchPrice();
        this.pricingForm.reset();
        this.addForm = false;
        this.toastr.success(response.message);
      },
      error: (error: any) => {
        console.log(error);
        this.toastr.warning(error.message);
      },
    });
  }


  // ----------------------------------------BUTTONS CONTROL PANEL---------------------------------------------
  toggleFormVisibility() {
    this.addForm = !this.addForm;
    this.isEditMode = false;
    this.pricingForm.reset();
    this.pricingForm.patchValue({
      country:'',
      city:'',
      service:'',
      distancebaseprice:'',
    });
  }
  CancelForm() {
    this.addForm = false;
    this.showButton = true;
    this.isEditMode = false;
    this.pricingForm.reset();
    this.pricingForm.patchValue({
      country:'',
      city:'',
      service:'',
      distancebaseprice:'',
    });

  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}

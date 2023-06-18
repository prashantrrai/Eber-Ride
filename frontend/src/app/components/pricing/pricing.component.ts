import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/Service/auth.service';
import { PricingService } from 'src/app/Service/pricing.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent {

  showButton: boolean = true;
  addForm: boolean = false;
  pricingForm!: FormGroup
  selectedCity: any
  selectedCountry: any;
  citiesname: any[] = [];
  countriesname: any[] = [];
  serviceData: any[] = [];
  selectedVehicle: any;
  distbasePriceArray: any[] = [];

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private _pricing: PricingService
  ) {}

  ngOnInit(): void {
    this.getCountry()
    this.getCity()
    this.getService()


    this.pricingForm = this.formBuilder.group({
      country: [''],
      city: [''],
      service: [''],
      driverprofit: [''],
      minfare: [''],
      distancebaseprice: [''],
      baseprice: [''],
      ppudist: [''],
      pputime: [''],
      maxspace: [''],

    });

  }

    // ----------------GET COUNTRY DATA---------------
    getCountry(): void {
      this._pricing.getCountryData().subscribe({
        next: (response) => {
          const country = response.countrydata.map((obj: any) => obj.countryName);
          this.countriesname = country;
        },
        error: (error) => {
          console.log(error.error.message);
        }
      });
    }
    onSelectedCountry(value: any) {
      this.selectedCountry = value;
      // console.log(value)
    }

    // -----------------GET CITY DATA---------------
    getCity(): void {
      this._pricing.getCityData().subscribe({
        next: (response) => {
          const city = response.map((obj: any) => obj.city);
          this.citiesname = city;
        },
        error: (error) => {
          console.log(error.error.message);
        }
      });
    }
    onSelectedCity(city: any) {
      this.selectedCity = city;
      // console.log(city)
    }

    // -----------------GET SERVICE DATA---------------
    getService(): void {
      this._pricing.getServiceData().subscribe({
        next: (response) => {
          const service = response.data.map((obj: any) => obj.vehicleName);
          this.serviceData = service;
        },
        error: (error) => {
          console.log(error.error.message);
        }
      });
    }
    onSelectedVehicle(service: any): void {
      this.selectedVehicle = service
      // console.log(service);
      
    }



  // --------------------------------------------ADD VEHICLE PRICING FXN---------------------------------------------
  AddPricing(){
    const formValues = this.pricingForm.value;
    console.log(formValues);
  }

  





  
  toggleFormVisibility() {
    this.addForm = !this.addForm;
    this.showButton = false;
  }
  CancelForm(){
    this.addForm = false;
    this.showButton = true;
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }

}

import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/Service/auth.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent {

  AddbuttonForm: boolean = false;
  updateForm: boolean = false;
  pricingForm!: FormGroup
  selectedCity: any
  citiesname: any[] = [];

  constructor(
    private toastr: ToastrService,
    private authService: AuthService
  ) {}
  

  onSelectedCity(value: any) {
    this.selectedCity = value;
    console.log(value)
  }

  AddPricing(){
    alert("wjednjkddndvk")
  }

  
  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
    this.updateForm = false
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }

}

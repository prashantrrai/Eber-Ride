import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent {
  countryForm!: FormGroup;
  AddbuttonForm: boolean = false;
  countryData: any = [];
  file: any;
  flag: any

  OnSubmit(){
    alert("workign")
  }

  onSelected(event: any) {
    this.file = event.target.files[0];
  }

  toggleFormVisibility(){
    this.AddbuttonForm = !this.AddbuttonForm;
  }

  cancel(){
    this.AddbuttonForm = false;
  }


}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  countryForm!: FormGroup;
  AddbuttonForm: boolean = false;
  countryData: any[] = [];
  file: any;
  flag: any;

  constructor(private http: HttpClient) {
    this.countryForm = new FormGroup({
      countryname: new FormControl(''),
      countrytimezone: new FormControl(''),
      countrycode: new FormControl(''),
      countrycurrency: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.fetchCountryData();
  }

  fetchCountryData() {
    this.http.get<any>('https://restcountries.com/v3.1/all').subscribe({
      next: (response) => {
        this.countryData = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onSelected(countryValue: string) {
    const selectedCountry = this.countryData.find((country) => country.name.common === countryValue);
    if (selectedCountry) {
      const currencyCode = selectedCountry.currencies[0];
      console.log(currencyCode)
      const currencyObject = this.getMatchingCurrencyObject(currencyCode);
      if (currencyObject) {
        const currencySymbol = currencyObject.symbol;
        this.countryForm.patchValue({
          countryname: selectedCountry.name.common,
          countrytimezone: selectedCountry.timezones[0],
          countrycode: selectedCountry.cca2,
          countrycurrency: currencySymbol
        });
      }
    }
  }
  
  getMatchingCurrencyObject(currencyCode: string) {
    const currencies = this.countryData.flatMap((country) => country.currencies);
    return currencies.find((currency) => currency.code === currencyCode) || null;
  }

  OnSubmit() {
    alert('working');
    console.log(this.countryForm.value);
  }

  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
  }

  cancel() {
    this.AddbuttonForm = false;
  }
}
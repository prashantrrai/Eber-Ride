import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CountryService } from '../Service/country.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {

  countryForm!: FormGroup;
  AddbuttonForm: boolean = false;
  countryData: any;
  file: any;
  symbol: any;
  currenciesObj: any;
  currencyKeys: any;
  firstCurrencyKey: any;
  currencysymbol: any;
  flag: any;
  addcountrydata :any = {
          countryname: '',
          countrycurrency : '',
          countrytimezone: '',
          countrycode: '',
          flag: ''
      }
  countryDataDB: any;


  constructor(private http: HttpClient, private _country: CountryService, private formbuilder: FormBuilder) {
    
  }

  ngOnInit(): void {
    this.fetchCountryDataAPI();

    this.countryForm = this.formbuilder.group({
            countryname:['', Validators.required],
            countrytimezone: ['' , Validators.required],
            countrycode:['', Validators.required],
            countrycurrency:['', Validators.required],
            flag:['', Validators.required]
          });

    this.getDatafromDB()
    
  }

  getDatafromDB() :void{
    this._country.getcountryData().subscribe({
      next: (response: any) => {
        this.countryDataDB = response
        console.log(this.countryDataDB)
      },
      error: (err) => {
        alert(err);
      },
    });
  }

  fetchCountryDataAPI() :void{
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
      const selectedCountry = this.countryData.find((country:any) => country.name.common === countryValue);
        // console.log(selectedCountry.currencies.INR.symbol)

        this.currenciesObj = selectedCountry.currencies;
        this.currencyKeys = Object.keys(this.currenciesObj);
        this.firstCurrencyKey = this.currencyKeys[0];
        this.currencysymbol = this.currenciesObj[this.firstCurrencyKey];
        this.symbol = this.currencysymbol.symbol;
        this.flag = selectedCountry.flags.png;

        if (selectedCountry) {
          this.countryForm.patchValue({
            countryname: selectedCountry.name.common,
            countrytimezone: selectedCountry.timezones,
            countrycode: selectedCountry.cca2,
            countrycurrency: this.symbol,
            flag: selectedCountry.flags.png
          });
        }
      }

      //In this code, we first check if res is defined and has a length greater than 0. Then, we access selectedCountry.currencies to get the currencies object. We retrieve the currency keys using Object.keys(currencies) and check if there is at least one currency key. If there is, we select the first currency key (currencyKeys[0]) and retrieve the corresponding currency object from currencies. Finally, we check if the currency object and symbol property exist before assigning currency.symbol to this.countrycurrency and logging it.Please note that this code assumes you want to retrieve the currency symbol for the first currency listed in the currencies object. If you want to handle multiple currencies or a different selection logic, you may need to adjust the code accordingly.

     

      OnSubmit() {
        if (this.countryForm.valid) {
  
          const formvalue = this.countryForm.value
          
          this.addcountrydata ={
            countryName:formvalue.countryname,
            countryCurrency :formvalue.countrycurrency,
            countryTimeZone:formvalue.countrytimezone[0],
            countryCode:formvalue.countrycode,
            flagImage:formvalue.flag
        }
        // console.log(formvalue)
        // console.log(this.addcountrydata)
          this._country.addCountry(this.addcountrydata).subscribe({
          next:  (res) => {
              console.log(res)
              alert('Country Added Successfully');
            },
          error:  (error) => {
              console.log(error);
              alert(error.error.error);
            }
        });
        }
      }



  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm; 
  }

  cancel() {
    this.AddbuttonForm = false;
  }
}
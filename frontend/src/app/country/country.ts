// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { CountryService } from 'src/app/service/country.service';
// import { ToastrService } from 'ngx-toastr';

// @Component({
//   selector: 'app-country',
//   templateUrl: './country.component.html',
//   styleUrls: ['./country.component.css']
// })

// export class CountryComponent {
//   countryForm!: FormGroup;
//   countrydata: any = [];
//   selectedCountry: any = [];
//   country: any;
//   countryname : any ;
//   countrytimezone: any;
//   countrycode: any;
//   countrycurrency: any;
//   currencies: any;
//   flag: any;
//   isshow: boolean = false;
//   countrydatabasedata: any = [];
//   addcountrydata :any = {
//       countryname:'',
//       countrycurrency :'',
//       countrytimezone:'',
//       countrycode:'',
//       flag:''
//   }




//   // addcountrydata = {
//   //   countryname :'this.selected ',
//   //   countrycode: 'this.countrytizone ',
//   //   countrytizone:' this.countrycode',
//   //   countrycurrency: ' this.countrycurrency',
//   //   flag: 'this.flag'
//   // }




//   constructor(private _country: CountryService ,  private formBuilder: FormBuilder ,  private toster: ToastrService) {}
//   ngOnInit(): void {
//     // get countrydata
//     this._country.getcountrydata().subscribe((res) => {
//       this.countrydata = res;
//       // console.log(this.countrydata);
//     })

//     this.countryForm = this.formBuilder.group({
//       countryname:['', Validators.required],
//       countrytimezone: ['' , Validators.required],
//       countrycode:['', Validators.required],
//       countrycurrency:['', Validators.required],
//       flag:['', Validators.required]

//     });

//     this._country.getcountrydatabasedata().subscribe((res)=>{
//       this.countrydatabasedata = res;
//       // console.log(this.countrydatabasedata);

//     })


//   }

//   onSelected(value: string): void {
//     this.countryname = value;
//     // console.log(this.countryname);

//     this._country.getcountry(value).subscribe((res) => {

//       this.country = res;
//       this.countrytimezone = this.country[0].timezones[0];
//       // console.log(this.countrytimezone);
//       this.countrycode = this.country[0].idd.root + this.country[0].idd.suffixes;
//       // console.log(this.countrycode);
//       this.flag = this.country[0].flags.png;
//       // console.log(this.flag);
//       if (this.country[0].currencies) {
//         const currencies = this.country[0].currencies;
//         const currencyKeys = Object.keys(currencies);
//         if (currencyKeys.length > 0) {
//           const firstCurrencyKey = currencyKeys[0];
//           const currency = currencies[firstCurrencyKey];
//           if (currency && currency.symbol) {
//             this.countrycurrency = currency.symbol;
//             // console.log(this.countrycurrency);
//           }
//         }

//       }
//       //In this code, we first check if res is defined and has a length greater than 0. Then, we access this.country[0].currencies to get the currencies object. We retrieve the currency keys using Object.keys(currencies) and check if there is at least one currency key. If there is, we select the first currency key (currencyKeys[0]) and retrieve the corresponding currency object from currencies. Finally, we check if the currency object and symbol property exist before assigning currency.symbol to this.countrycurrency and logging it.Please note that this code assumes you want to retrieve the currency symbol for the first currency listed in the currencies object. If you want to handle multiple currencies or a different selection logic, you may need to adjust the code accordingly.

//       this.countryForm.patchValue({
//         countryname:  this.countryname ,
//         countrytimezone:  this.countrytimezone ,
//         countrycode: this.countrycode,
//         countrycurrency:this.countrycurrency ,
//         flag:  this.flag

//     })

//     });


//   }

//   OnSubmit(){

//     // const countryForm = new FormData();
//     // countryForm.append('countryname', this.countryForm.value.countryname);
//     // countryForm.append('countrytimezone', this.countryForm.value.countrytimezone);
//     // countryForm.append('countrycode', this.countryForm.value.countrycode);
//     // countryForm.append('countrycurrency', this.countryForm.value.countrycurrency);
//     // countryForm.append('flag', this.countryForm.value.flag);

//     // console.log(this.countryForm.value);


//     const formvalue = this.countryForm.value
//     this.addcountrydata ={
//       countryname:formvalue.countryname,
//       countrycurrency :formvalue.countrycurrency,
//       countrytimezone:formvalue.countrytimezone,
//       countrycode:formvalue.countrycode,
//       flag:formvalue.flag
//   }


//     this._country.addcountry(this.addcountrydata).subscribe({
//       next: (res: any) => {
//         this.countrydatabasedata.push(res.countrydata);
//         this.toster.success(res.message);

//       },
//       error: (error) => {
//         // console.log();
//         this.toster.warning(error.error.message);
//       },
//     });


//   }

//   OnAddbuttonclick(){
//     this.isshow = true;
//   }

//   cancel(){
//     this.isshow = false;
//   }

// }

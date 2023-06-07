// import { Component, ElementRef, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { ToastrService } from 'ngx-toastr';
// import { CityService } from 'src/app/service/city.service';
// import { HttpClient } from '@angular/common/http';
// declare var google: any;
// @Component({
//   selector: 'app-city',
//   templateUrl: './city.component.html',
//   styleUrls: ['./city.component.css'],
// })
// export class CityComponent {

//   @ViewChild('searchBox', { static: false }) searchBox!: ElementRef;
//   @ViewChild('checkLocationInput', { static: false }) checkLocationInput!: ElementRef;

//   autocomplete: any;
//   cityform!: FormGroup;
//   countrydata: any = [];
//   isshow: boolean = false;
//   map: any;
//   selectedCountry: any;
//   countryname: any;
//   country: any;
//   drawingManager: any;
//   polygon: any;
//   isInZone: any;
//   allcoordinates: any;
//   inputValue: any;
//   coordinates: any;
//   isaddbutton:boolean = false ;
//   // table
//   citydatabasedata: any;
//   page: number = 1;
//   count: number = 0;
//   tableSize: number = 3;
//   tableSizes: any = [3, 6, 9, 12];
//   p: number = 1;
//   pageSize: any;

//   constructor(
//     private _cityservice: CityService,
//     private formBuilder: FormBuilder,
//     private toster: ToastrService,
//     private http: HttpClient
//   ) { }

//   ngOnInit() {
//     this._cityservice.getcountry().subscribe({
//       next: (countries: any) => {
//         // countries.forEach((o: any) => {
//           //   if (o.countryname) {
//             //     this.countryname = o.countryname;

//         //     this.countrydata.push(this.countryname);
//         //     // console.log(this.countryname);
//         //   }
//         // });
//         // console.log(countries);

//         this.countrydata = countries
//       },
//       error: (error) => {
//         console.log(error);
//       },
//       // console.log(this.usercountrycodedata);
//     });
//     this.fetchcitydata();
//     this.initMap();
//   }

//   initMap() {
//     // Initialize map
//     this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
//       center: { lat: 22.3039, lng: 70.8022 },
//       zoom: 4
//     });
//     const input = document.getElementById('search-box') as HTMLInputElement;
//     this.autocomplete = new (google as any).maps.places.Autocomplete(input);
//     this.autocomplete.setFields(['geometry']);
//     this.autocomplete.addListener('place_changed', () => {
//       this.onPlaceChanged();
//     });

//     this.drawingManager = new google.maps.drawing.DrawingManager({
//       drawingMode: google.maps.drawing.OverlayType.POLYGON,
//       drawingControl: true,
//       drawingControlOptions: {
//         position: google.maps.ControlPosition.TOP_CENTER,
//         drawingModes: [google.maps.drawing.OverlayType.POLYGON]
//       }
//     });

//     this.drawingManager.setMap(this.map);

//     google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event: any) => {
//       if (event.type === google.maps.drawing.OverlayType.POLYGON) {
//         if (this.polygon) {
//           this.polygon.setMap(null);
//         }
//         console.log(event);

//         this.polygon = event.overlay
//         console.log(this.polygon);


//       }
//     });
//   }

//   onPlaceChanged() {
//     const place = this.autocomplete.getPlace();
//     if (place.geometry && place.geometry.location) {
//       const lat = place.geometry.location.lat();
//       const lng = place.geometry.location.lng();
//       // Do something with the latitude and longitude
//       console.log('Latitude:', lat);
//       console.log('Longitude:', lng);
//     }
//   }
//   //  this countryName use  for rest api for cities
//   countryName: any

//   onSelected(value: any) {
//     this.country = value  // country id
//     //   selected country id and api countrydata  match and when both id match then  that id  show a countryname that countryname to use in rest api
//     console.log(this.country);


//     this.countrydata.map((country: any) => {
//       if (country._id === value) {
//         this.countryName = country.countryname
//       }
//     })

//     // Update autocomplete restrictions based on the selected country
//     this.http.get<any>(`https://restcountries.com/v3.1/name/${this.countryName}`).subscribe(
//       {

//         next: countryRes => {
//           let rcountry = countryRes.filter((obj: any) => {
//             return obj.name.common == this.countryName

//           })
//           // console.log(this.countryName);
//           // console.log(rcountry);
//           // console.log(rcountry[0].cca2.toLowerCase());
//           let code = rcountry[0].cca2.toLowerCase()
//           // console.log(code);


//           this.autocomplete.setTypes(['(cities)']);
//           this.autocomplete.setComponentRestrictions({ 'country': code });

//         },
//         error: error => {
//           console.log("country select error ", error.message);
//         }
//       }
//     )
//     // this.autocomplete.setComponentRestrictions({ country: this.selectedCountry });
//     // this.autocomplete.setTypes(['(cities)']);
//     // this.autocomplete.setFields(['geometry']);
//   }

//   checkLocation() {
//     const geocoder = new google.maps.Geocoder();
//     this.inputValue = this.searchBox.nativeElement.value; // Get the value of the input
//     // console.log(this.inputValue);

//     geocoder.geocode({ address: this.inputValue }, (results: any, status: any) => {
//       if (status === 'OK') {
//         const location = results[0].geometry.location;
//         this.isInZone = google.maps.geometry.poly.containsLocation(location, this.polygon);
//         // this.toster.success("Yes, Your entered location belongs to drawn zone.")
//       } else {
//         alert(status);
//       }
//       console.log(this.isInZone);
//       if (this.isInZone == true) {
//         const polygonPath = this.polygon.getPath();
//         this.toster.success("Yes, Your entered location belongs to drawn zone.")

//         this.coordinates = polygonPath.getArray().map((results: { lat: () => any; lng: () => any; }) => ({
//           lat: results.lat(),
//           lng: results.lng(),
//         }));

//         // console.log('Coordinates:', coordinates);
//         // this.allcoordinates ={Coordinates : coordinates };


//       } else {
//         console.log("zone coordinates not found");
//         this.toster.warning("Sorry! Entered location doesn’t belong to drawn zone.")

//       }
//     });
//   }

//   addcity() {
//     const payload = {
//       coordinates: this.coordinates,
//       city: this.inputValue,
//       countryid: this.country
//     };

//     console.log(payload);
//     if (this.isInZone == true) {
//       this._cityservice.addcity(payload).subscribe({
//         next: (res: any) => {
//           this.citydatabasedata.push(res.city);
//           this.toster.success(res.message);

//         },
//         error: (error) => {
//           // console.log();
//           this.toster.warning(error.error.message);
//         },
//       });

//     } else {
//       this.toster.warning("please choose city and create a zone");

//     }
//   }

//   // table


//   fetchcitydata() : void {
//       this._cityservice.getcity().subscribe(
//         (response) => {
//           this.citydatabasedata= response;
//           console.log(response);
//         },
//         (error) => {
//           console.log(error);
//         }
//       );
//     }
//     // onTableDataChange(event: any) {
//     //   this.page = event;
//     //   this.fetchcitydata();
//     // }
//     // onTableSizeChange(event: any): void {
//     //   this.tableSize = event.target.value;
//     //   this.page = 1;
//     //   this.fetchcitydata();
//     // }
//     onPageChange(event: any): void {
//       this.page = event;
//       this.fetchcitydata();
//     }

//     onPageSizeChange(event: any): void {
//       this.tableSize = event.target.value;
//       this.page = 1;
//       this.fetchcitydata();
//     }



//   }
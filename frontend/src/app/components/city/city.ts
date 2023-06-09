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
//   isaddbutton: boolean = true;
//   isupdatebutton: boolean = false;
//   // table
//   citydatabasedata: any;
//   page: number = 1;
//   count: number = 0;
//   tableSize: number = 3;
//   tableSizes: any = [3, 6, 9, 12];
//   p: number = 1;
//   pageSize: any;

//   // update
//   id: any;
//   isDisabled: boolean = false;
//   marker: any;

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
//         //   if (o.countryname) {
//         //     this.countryname = o.countryname;

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
//       zoom: 8
//     });
//     const markerPosition = { lat: 22.3039, lng: 70.8022 };
//     this.marker = new google.maps.Marker({
//       map: this.map,
//       draggable: true,
//       animation: google.maps.Animation.DROP,
//       Position: markerPosition
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
//       this.marker.setPosition(place.geometry.location);
//       this.map.setCenter(place.geometry.location);
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
//     // console.log(this.countryName);


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
//         if (this.isInZone == true) {
//           const polygonPath = this.polygon.getPath();
//           this.toster.success("Yes, Your entered location belongs to drawn zone.")

//           this.coordinates = polygonPath.getArray().map((results: { lat: () => any; lng: () => any; }) => ({
//             lat: results.lat(),
//             lng: results.lng(),
//           }));

//           console.log('Coordinates:', this.coordinates);
//           // this.allcoordinates ={Coordinates : coordinates };


//         } else {
//           console.log("zone coordinates not found");
//           this.toster.warning("Sorry! Entered location doesn’t belong to drawn zone.")

//         }
//       } else {
//         alert(status);
//       }
//       console.log(this.isInZone);

//     });
//   }

//   addcity() {
//     const payload = {
//       coordinates: this.coordinates,
//       city: this.inputValue,
//       countryid: this.country
//     };
//     // check the location and polygon
//     const geocoder = new google.maps.Geocoder();
//     this.inputValue = this.searchBox.nativeElement.value; // Get the value of the input
//     console.log(this.inputValue);

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
//         //  first create  a coordinates
//         this.coordinates = polygonPath.getArray().map((results: { lat: () => any; lng: () => any; }) => ({
//           lat: results.lat(),
//           lng: results.lng(),
//         }));
//         this.toster.success("res.message");
//         // console.log('Coordinates:', this.coordinates);
//         // this.allcoordinates ={Coordinates : coordinates };

//         this._cityservice.addcity(payload).subscribe({
//           next: (res: any) => {
//             this.citydatabasedata.push(res.city);
//             this.toster.success(res.message);
//           },
//           error: (error) => {
//             // console.log();
//             this.toster.warning(error.error.message);
//           },
//         });

//       } else {
//         // console.log("zone coordinates not found");
//         this.toster.warning("Sorry! Entered location doesn’t belong to drawn zone.")

//       }
//     });

//     // console.log(payload);
//     // if (this.isInZone == true) {
//     //   this._cityservice.addcity(payload).subscribe({
//     //     next: (res: any) => {
//     //       this.citydatabasedata.push(res.city);
//     //       this.toster.success(res.message);
//     //     },
//     //     error: (error) => {
//     //       // console.log();
//     //       this.toster.warning(error.error.message);
//     //     },
//     //   });

//     // } else {
//     //   this.toster.warning("please choose city and create a zone");

//     // }

//   }

//   // table


//   fetchcitydata(): void {
//     this._cityservice.getcity().subscribe(
//       (response) => {
//         this.citydatabasedata = response;
//         console.log(response);
//       },
//       (error) => {
//         console.log(error);
//       }
//     );
//   }
//   // onTableDataChange(event: any) {
//   //   this.page = event;
//   //   this.fetchcitydata();
//   // }
//   // onTableSizeChange(event: any): void {
//   //   this.tableSize = event.target.value;
//   //   this.page = 1;
//   //   this.fetchcitydata();
//   // }
//   onPageChange(event: any): void {
//     this.page = event;
//     this.fetchcitydata();
//   }

//   onPageSizeChange(event: any): void {
//     this.tableSize = event.target.value;
//     this.page = 1;
//     this.fetchcitydata();
//   }



//   // updatecitybutton(_id: string, city: any) {
//   //   this.isaddbutton = false;
//   //   this.isupdatebutton = true;
//   //   this.isDisabled = true;

//   //   this.id = city._id;
//   //   this.inputValue = city.city;
//   //   this.country = city.countrydata.countryname;
//   //   console.log(this.country);


//   //   // Remove existing polygon if it exists
//   //   if (this.polygon) {
//   //     this.polygon.setMap(null);
//   //   }
//   //   if (this.marker) {
//   //     this.marker.setMap(null);
//   //     // this.marker = null;
//   //   }


//   //   const coordinatesdatabase = city.coordinates;
//   //   const polygonPath = coordinatesdatabase.map((coordinate: any) => ({
//   //     lat: coordinate.lat,
//   //     lng: coordinate.lng
//   //   }));

//   //   this.polygon = new google.maps.Polygon({
//   //     paths: polygonPath,
//   //     editable: true,
//   //     draggable: true,
//   //     strokeColor: '#000000',
//   //     strokeOpacity: 0.8,
//   //     strokeWeight: 2,
//   //     fillColor: '#000000',
//   //     fillOpacity: 0.35
//   //   });

//   //   this.polygon.setMap(this.map);
//   //   this.coordinates = polygonPath.getArray().map((results: { lat: () => any; lng: () => any; }) => ({
//   //     lat: results.lat(),
//   //     lng: results.lng(),
//   //   }));
//   //   // console.log(this.coordinates);

//   //   const markerPosition = polygonPath[0];
//   //   const updatemarker = new google.maps.Marker({
//   //     position: markerPosition,
//   //     map: this.map
//   //   });
//   //   updatemarker.setMap(this.map);
//   //   this.map.setCenter(polygonPath[0]);
//   //   this.drawingManager.setMap(this.map);
//   // }

//   updatecitybutton(_id: string, city: any) {
//     this.isaddbutton = false;
//     this.isupdatebutton = true;
//     this.isDisabled = true;

//     this.id = city._id;
//     this.inputValue = city.city;
//     this.country = city.countrydata.countryname;

//     // Remove existing polygon if it exists
//     if (this.polygon) {
//       this.polygon.setMap(null);
//     }
//     if (this.marker) {
//       this.marker.setMap(null);
//     }

//     const coordinatesdatabase = city.coordinates;
//     const polygonPath = coordinatesdatabase.map((coordinate: any) => ({
//       lat: coordinate.lat,
//       lng: coordinate.lng
//     }));

//     // Create a polygon based on the coordinates
//     this.polygon = new google.maps.Polygon({
//       paths: polygonPath,
//       editable: true,
//       draggable: true,
//       strokeColor: '#000000',
//       strokeOpacity: 0.8,
//       strokeWeight: 2,
//       fillColor: '#000000',
//       fillOpacity: 0.35
//     });

//     this.polygon.setMap(this.map);
// // calculate a polygon center for marker position
//     const centroid = this.calculatePolygonCentroid(polygonPath);

//     // Add a marker at the first coordinate of the polygon
//     const markerPosition = polygonPath[0];
//     this.marker = new google.maps.Marker({
//       position: centroid,
//       map: this.map
//     });

//     this.map.setCenter(centroid);
//     this.drawingManager.setMap(this.map);

//   }
//   calculatePolygonCentroid(polygonPath: any) {
//     let latSum = 0;
//     let lngSum = 0;
//     const len = polygonPath.length;

//     for (let i = 0; i < len; i++) {
//       latSum += polygonPath[i].lat;
//       lngSum += polygonPath[i].lng;
//     }

//     const centroidLat = latSum / len;
//     const centroidLng = lngSum / len;

//     return { lat: centroidLat, lng: centroidLng };
//   }

// //   updatecity() {
// //     const payload = {
// //       coordinates: this.coordinates,
// //       city: this.inputValue,
// //       countryid: this.country
// //     };
// //     // check the location and polygon
// //     const geocoder = new google.maps.Geocoder();
// //     this.inputValue = this.searchBox.nativeElement.value; // Get the value of the input

// //     geocoder.geocode({ address: this.inputValue }, (results: any, status: any) => {
// //       if (status === 'OK') {
// //         const location = results[0].geometry.location;
// //         this.isInZone = google.maps.geometry.poly.containsLocation(location, this.polygon);
// //         this.toster.success("Yes, Your entered location belongs to drawn zone.")
// //       } else {
// //         alert(status);
// //       }
// //       console.log(this.isInZone);
// //       if (this.isInZone == true) {
// //         this._cityservice.updatecity(payload, this.id).subscribe({
// //           next: (res: any) => {
// //             let updatetedcity = this.citydatabasedata.find((obj: any) => {
// //               return obj._id === res._id
// //             })
// //             // console.log(updatetedcity);
// //             let key = Object.keys(updatetedcity)

// //             key.forEach((key: any) => {
// //               updatetedcity[key] = res[key]
// //             })
// //             this.toster.success("update city successfully ");
// //             // let objToUpdate = this.vehicledatadfghjk.push(function (obj: any) {
// //             //   return obj._id == updateId})

// //           },
// //           error: (error) => {
// //             console.log(error.error.message);
// //             this.toster.warning(error.error.message)
// //           }
// //         });
// //       } else {
// //         // console.log("zone coordinates not found");
// //         this.toster.warning("Sorry! Entered location doesn’t belong to drawn zone.")

// //       }
// //     });
// //   }
// // }

// updatecity() {
//   this.checkLocation();
//     const payload = {
//       coordinates: this.coordinates,
//       city: this.inputValue,
//       countryid: this.country
//     };

//       if (this.isInZone == true){
//         this._cityservice.updatecity(payload, this.id).subscribe({
//           next: (res: any) => {
//             let updatetedcity = this.citydatabasedata.find((obj: any) => {
//               return obj._id === res._id
//             })
//             // console.log(updatetedcity);
//             let key = Object.keys(updatetedcity)

//             key.forEach((key: any) => {
//               updatetedcity[key] = res[key]
//             })
//             this.toster.success("update city successfully ");
//             // let objToUpdate = this.vehicledatadfghjk.push(function (obj: any) {
//             //   return obj._id == updateId})

//           },
//           error: (error) => {
//             console.log(error.error.message);
//             this.toster.warning(error.error.message)
//           }
//         });
//       }

//   }
// }


// //   updateMap(coordinates: any[]): void {
// //     const polygonPath = coordinates.map((coordinate: any) => ({
// //       lat: coordinate.lat,
// //       lng: coordinate.lng
// //     }));

// //     // this.map.removePolygons();
// //     // this.map.removeMarkers();
// //     // Assuming you have a Google Maps instance available as 'map'
// //     const polygon = new google.maps.Polygon({
// //       paths: polygonPath,
// //       strokeColor: '#FF0000',
// //       strokeOpacity: 0.8,
// //       strokeWeight: 2,
// //       fillColor: '#FF0000',
// //       fillOpacity: 0.35
// //     });
// //     // this.map.drawPolygon(coordinates);
// //     polygon.setMap(this.map);

// //     const marker = new google.maps.Marker({
// //       position: polygonPath[0],
// //       map: this.map,
// //       title: 'City Location'
// //     });

// //     this.map.setCenter(polygonPath[0]);
// //     this.drawingManager.setMap(this.map);
// //   }
// //   onUpdateCity(form: NgForm) {
// //     if (this.isPolygonDrawn) {
// //       const coordinates = this.polygon.getPath().getArray().map((point: any) => ({
// //         lat: point.lat(),
// //         lng: point.lng()
// //       }));

// //       const updatedCity = {
// //         country: this.selectedCountry,
// //         city: this.enteredLocation,
// //         coordinates: coordinates
// //       };

// //       this.cityService.updateCity(this.editingCityId, updatedCity).subscribe((res) => {
// //         const index = this.citiesrcvd.findIndex(city => city._id === this.editingCityId);
// //         if (index !== -1) {
// //           this.citiesrcvd[index] = res.citydata;
// //         }
// //         this.toastr.success('City updated successfully!', 'Success');
// //       });
// //     } else {
// //       this.toastr.warning('Please draw a polygon on the map before updating the city.', 'Warning');
// //     }
// //   }

// // }
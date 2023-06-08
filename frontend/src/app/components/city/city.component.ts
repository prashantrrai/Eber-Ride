import { Component, OnInit } from '@angular/core';
import { CityService } from '../../Service/city.service';
declare var google: any;
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';


@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
  cityForm!: FormGroup;
  citydata :any = {
    countryname: '',
    cityname : '',
}
  addedCities: string[] = [];
  newCity: string = '';
  isValidCity: boolean = false;
  isDuplicateCity: boolean = false;

  //map
  map: any;
  drawingManager: any;
  polygon: any;
  isInZone: boolean = false;
  cordsArray: any = [];
  marker: any;
  autocomplete: any;

  //get country data
  selectedCountry: string = '';
  selectedCountryName!: string;
  countryData: any[] = [];
  cityData: any[] = [];

  countries: any;
  coordinates: any;
  inputValue: any;
  isaddbutton: boolean = true;
  isupdatebutton: boolean = false;
  isCountryDisabled: boolean = false;
  id: any;
  page: any;
  tableSize: any;
  count: any;
  countryName: any;

  constructor(private toastr: ToastrService, private _city: CityService, private http: HttpClient, private formBuilder: FormBuilder,){
    this.cityForm = new FormGroup({
      countryname: new FormControl({ value: null, disabled: false }),
      cityname: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.cityForm = this.formBuilder.group({
      countryname: '',
      cityname: ''
    });
    this.loadCities()
    this.getCountryNamefromDB()
    this.initMap();
  }
  
  // To set the Location of searched from Input field and modify it..........
  setLocation(place: any) {
    if (!place.geometry) {
      console.error('No geometry found for place:', place);
      return;
    }

    if (place.geometry && place.geometry.location) {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(8);
      this.marker.setPosition(place.geometry.location);
      this.marker.setVisible(true);
    }
  }

    
  onPlaceChanged() {
    const place = this.autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      // Do something with the latitude and longitude
      console.log('Latitude:', lat);
      console.log('Longitude:', lng);
    }
  }




  // To load the map on Screen.............
  initMap() {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 4
    });

    const input = document.getElementById('inputCity') as HTMLInputElement;
    this.autocomplete = new google.maps.places.Autocomplete(input);

    this.autocomplete.addListener('place_changed', () => {
      const place: any = this.autocomplete.getPlace();
      this.onPlaceChanged();    //place change in select.
      this.setLocation(place)    // set location in search.

    });


    // Add Location Marker or Pin on the searched location..............
    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      anchorPoint: new google.maps.Point(0, -29)
    });

    // to draw the polygon on the map using DrawingManager()............
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      }
    });

    this.drawingManager.setMap(this.map);

    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event: any) => {
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        if (this.polygon) {
          this.polygon.setMap(null);  //clearing old drawn polygon
        }
        this.polygon = event.overlay;
      }
    });
  }
  
  // To fetch country data from from /countrydata API in dropdown..........
  getCountryNamefromDB() :void{
      this._city.getcountryData().subscribe({
        next: (response) => {
          this.countryData = response.countrydata;
        },
        error: (error) => {
          console.log(error);
        }
      });
    }

  loadCities(): void {
    this._city.getcity().subscribe({
    next:  (response) => {
        this.cityData = response;
        // console.log(response);
      },
    error:  (error) => {
        console.log(error);
      }
  });
  }
  

    // To SELECT country selected value from dropdown to use it in city input...........
    onSelected(value: any) {
      this.selectedCountry = value  // country id not value, object id from db
      console.log(this.selectedCountry)
  
      
      if (this.selectedCountry !== 'Select country') {
        this.isCountryDisabled = true;
      } else {
        this.isCountryDisabled = false;
      }
      
      this.countryData.map((country: any) => {
        if (country._id === value) {
          this.selectedCountryName = country.countryName
        }
      })
  
      // city Autocomplete based on selected country from onSelected().............
      this.http.get<any>(`https://restcountries.com/v3.1/name/${this.countryData}`).subscribe({
  
        next: (countryRes: any) => {
          let rcountry = countryRes.filter((obj: any) => {
            return obj.name.common == this.countryData
          })
  
          //getting country code like IN..............
          let code = rcountry[0].cca2.toLowerCase()
  
          this.autocomplete.setTypes(['(cities)']);
          this.autocomplete.setComponentRestrictions({ 'country': code });
        },
        error: (error: any) => {
          console.log("Country Selection Error....... ", error.message);
          this.toastr.error(error.message)
        }
        }
      )
    }

// To check the drawn Zone inside coordinates or not and add city in database.............
  checkZone_AddCity() {
    const geocoder = new google.maps.Geocoder();
    const input = document.getElementById('inputCity') as HTMLInputElement;

    geocoder.geocode({ address: input.value }, (results: any, status: any) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        // console.log(location)
        this.isInZone = google.maps.geometry.poly.containsLocation(location, this.polygon);

        if (this.isInZone == true) {
          const polygonPath = this.polygon.getPath();
          this.coordinates = polygonPath.getArray().map((results: { lat: () => any; lng: () => any; }) => ({
            lat: results.lat(),
            lng: results.lng(),
          }));
          console.log('Coordinates:', this.coordinates);
          
            const payload = {
              country_id: this.selectedCountry,
              city: input.value,
              coordinates: this.coordinates
            };
            console.log(payload)
  
            // To add city in Database...............
            this._city.addcity(payload).subscribe({
              next: (response: any) => {
                this.cityData.push(response.city);
                // this.toastr.success(response.message);
                alert(response.message)
              },
              error: (error) => {
                console.log(error.error.message)
                alert(error.error.message)
                // this.toastr.warning(error.error.message);
              },
            })
        }else{
          alert("Location not Inside Zone")
        } 
      }
      else {
        alert("please choose city and create a zone")
      }
      
    });
  }




  

  validateCity(): void {
    this.isDuplicateCity = this.addedCities.includes(this.newCity);
    this.isValidCity = !this.isDuplicateCity && this.newCity.trim() !== '';
  }


  onPageChange(event: any): void {
    this.page = event;
    this.loadCities();
  }

  onPageSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.loadCities();
  }

  updateCity(_id: string, city: any){
  // Disable the countryname form control
  this.cityForm.get('countryname')?.disable();
    this.cityForm.patchValue({
      countryname: city.countryDetails._id,
      cityname: city.city
    });
    
    this.isCountryDisabled = true;

    this.id = city._id;
    this.inputValue = city.city;
    this.selectedCountryName = city.countryDetails.countryName;
    console.log(this.selectedCountryName)

    const coordinatesdatabase = city.coordinates;
    // console.log(coordinatesdatabase);
    const polygonPath = coordinatesdatabase.map((coord: any) => new google.maps.LatLng(coord.lat, coord.lng));
    this.polygon.setPaths(polygonPath); //set polygon path
    this.polygon.setMap(null); // Remove the old polygon from the map
    this.polygon = new google.maps.Polygon({
      paths: polygonPath,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });
    this.polygon.setMap(this.map);
  }

}

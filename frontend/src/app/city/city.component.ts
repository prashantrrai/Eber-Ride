import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CityService } from '../Service/city.service';
declare var google: any;
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
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
  cityData: any;

  country: any;
  countries: any;
  countryData: any;
  coordinates: any;
  inputValue: any;
  citydatabasedata: any;

  constructor(private toastr: ToastrService, private _city: CityService, private http: HttpClient){}

  ngOnInit(): void {
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
      this.setLocation(place)

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
          // console.log(response.countrydata)
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  

// To check the drawn Zone inside coordinates or not and add city in database.............
  checkZone_AddCity() {
    const geocoder = new google.maps.Geocoder();
    const input = document.getElementById('inputCity') as HTMLInputElement;

    const payload = {
      country: this.country,
      city: input.value,
      coordinates: this.coordinates
    };


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
          
        this.toastr.success("City Added");
        alert("coordinates fetched of zone")
          // this._city.addcity(payload).subscribe({
          //   next: (response: any) => {
          //     this.citydatabasedata.push(response.city);
          //     this.toastr.success(response.message);
          //   },
          //   error: (error) => {
          //     this.toastr.warning(error.error.message);
          //   },
          // })
        } 
        else {
            this.toastr.warning("please choose city and create a zone");
        }
      } 
    });
  }



  // To select country selected value from dropdown to use it in city input...........
  onSelected(value: any) {
    this.country = value
    this.countryData.map((country: any) => {
      if (country.countryName === value) {
        this.countryData = country.countryName
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

  
  loadCities(): void {
  }

  validateCity(): void {
    this.isDuplicateCity = this.addedCities.includes(this.newCity);
    this.isValidCity = !this.isDuplicateCity && this.newCity.trim() !== '';
  }

  addCity(): void {
    if (this.isValidCity) {
      this.addedCities.push(this.newCity);
      this.newCity = '';
    }
  }

  updateCity(){
    alert("Hii")
  }

}

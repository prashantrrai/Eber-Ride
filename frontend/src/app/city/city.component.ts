import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CityService } from '../Service/city.service';
declare var google: any;
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit, AfterViewInit {
  // cityData: any[] = []
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
  }

  // TO fetch country data from from /countrydata API in dropdown..........
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

  ngAfterViewInit() {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 4
    });
    
    const input = document.getElementById('inputCity') as HTMLInputElement;
    this.autocomplete = new google.maps.places.Autocomplete(input);

    this.autocomplete.addListener('place_changed', () => {
      const place: any = this.autocomplete.getPlace();

      if (!place.geometry) {
        console.error('No geometry found for place:', place);
        return;
      }

      // Move map marker to selected location
      if (place.geometry && place.geometry.location) {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(12); // Increase the zoom level
        this.marker.setPosition(place.geometry.location);
        this.marker.setVisible(true);
      }
    });


    // Add Location Marker or Pin
    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      anchorPoint: new google.maps.Point(0, -29)
    });

    // to draw the polygon on the map
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
          this.polygon.setMap(null);
        }
        // console.log(event);

        this.polygon = event.overlay;
        // console.log(this.polygon);
      }
    });
  }

  checkZone_AddCity() {
    const geocoder = new google.maps.Geocoder();
    const input = document.getElementById('inputCity') as HTMLInputElement;
    // console.log('.....checkLocation.......' + input.value);

    const payload = {
      coordinates: this.coordinates,
      city: this.inputValue,
      countryid: this.country
    };

    console.log(payload);

    geocoder.geocode({ address: input.value }, (results: any, status: any) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        this.isInZone = google.maps.geometry.poly.containsLocation(location, this.polygon);
        
        if (this.isInZone) {
          this._city.addcity(payload).subscribe({
            next: (res: any) => {
              this.citydatabasedata.push(res.city);
              this.toastr.success(res.message);
            },
            error: (error) => {
              this.toastr.warning(error.error.message);
            },
          })
        } 
        else {
            this.toastr.warning("please choose city and create a zone");
        }
      } 
    });
  }



  // To select country selected value from dropdown to use it in city input...........
  onSelected(value: any) {
    //   selected country id and api countrydata  match and when both id match then  that id  show a countryname that countryname to use in rest api
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

        let code = rcountry[0].cca2.toLowerCase()
        this.autocomplete.setTypes(['(cities)']);
        this.autocomplete.setComponentRestrictions({ 'country': code });
      },
      error: (error: any) => {
        console.log("Country Selection Error....... ", error.message);
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

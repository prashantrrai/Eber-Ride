import { AfterViewInit, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
declare var google: any;

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements AfterViewInit {
  cityData: any[] = []
  countries: string[] = ['Country A', 'Country B', 'Country C']; // Replace with actual countries from the database
  addedCities: string[] = [];
  newCity: string = '';
  isValidCity: boolean = false;
  isDuplicateCity: boolean = false;

  map: any;
  drawingManager: any;
  polygon: any;
  isInZone: boolean = false;
  cordsArray: any = [];
  marker: any;
  autocomplete: any;

  constructor(private toastr: ToastrService){}

  
  setLocation(place: any) {
    if (!place.geometry) {
      console.error('No geometry found for place:', place);
      return;
    }

    if (place.geometry && place.geometry.location) {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(12);
      this.marker.setPosition(place.geometry.location);
      this.marker.setVisible(true);
    }
  }

  ngAfterViewInit() {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5
    });
    const input = document.getElementById('city') as HTMLInputElement;
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

    // Show current location on page load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        this.map.setCenter(currentLocation);
        this.marker.setPosition(currentLocation);
        this.marker.setVisible(true);
      });
    }

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
        console.log(event);

        this.polygon = event.overlay;
        console.log(this.polygon);
      }
    });
  }

  checkLocation() {
    const geocoder = new google.maps.Geocoder();
    const input = document.getElementById('city') as HTMLInputElement;
    console.log('.....checkLocation.......' + input.value);

    geocoder.geocode({ address: input.value }, (results: any, status: any) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        this.isInZone = google.maps.geometry.poly.containsLocation(location, this.polygon);
        if (this.isInZone) {
          this.toastr.success('Location inside Zone');
        } else {
          this.toastr.error('Location Not inside Zone');
        }
      } else {
        this.toastr.error('Geocode was not successful for the following reason: ' + status, 'Error');
      }
    });
  }


  loadCities(): void {
    // Fetch the cities for the selected country from the database
    // You'll need to implement the logic to fetch cities based on the selected country
    // and update the addedCities array accordingly
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
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from '../Service/auth.service';
import { ToastrService } from 'ngx-toastr';

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  enteredLocation: string = '';
  isLocationInZone: boolean = false;
  message: string = '';
  polygon: any;
  map: any;

  constructor(private authService: AuthService, private toastr: ToastrService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initializeMap();
  }

  initializeMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 40.7128, lng: -74.0060 }, // Set the center coordinates
      zoom: 12 // Set the initial zoom level
    });

    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON, // Set the drawing mode to polygon
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      map: this.map // Set the map object to enable drawing on the map
    });

    google.maps.event.addListener(drawingManager, 'polygoncomplete', (event: any) => {
      if (this.polygon) {
        this.polygon.setMap(null); // Clear previous polygon from the map
      }
      this.polygon = event.overlay;
    });

    google.maps.event.addListener(this.map, 'click', (event: any) => {
      if (this.polygon) {
        this.checkLocationAgainstZone(event.latLng, this.polygon);
      }
    });
  }

  checkLocationAgainstZone(location: any, polygon: any) {
    const point = new google.maps.LatLng(location.lat(), location.lng());
    this.isLocationInZone = google.maps.geometry.poly.containsLocation(point, polygon);

    if (this.isLocationInZone) {
      this.toastr.success('Yes, your entered location belongs to the drawn zone.');
    } else {
      this.toastr.error('Sorry, your entered location doesn’t belong to the drawn zone.');
    }
  }

  checkLocation() {
    const geocoder = new google.maps.Geocoder();
    const location = this.enteredLocation;

    geocoder.geocode({ address: location }, (results: any, status: any) => {
      if (status === 'OK') {
        const resultLocation = results[0].geometry.location;

        this.map.setCenter(resultLocation);
        const marker = new google.maps.Marker({
          position: resultLocation,
          map: this.map
        });

        if (this.polygon) {
          this.checkLocationAgainstZone(resultLocation, this.polygon);
        }
      } else {
        console.log('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
declare var google: any;
declare namespace google.maps {
  interface LatLng {
    lat: number;
    lng: number;
  }

  interface GeocoderResult {
    geometry: {
      location: LatLng;
    };
    // Add other properties of the GeocoderResult if needed
  }

  interface Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[], status: GeocoderStatus) => void
    ): void;
    // Add other methods of the Geocoder if needed
  }

  interface GeocoderRequest {
    address?: string;
    // Add other properties of the GeocoderRequest if needed
  }

  type GeocoderStatus =
    | 'OK'
    | 'ZERO_RESULTS'
    | 'OVER_QUERY_LIMIT'
    | 'REQUEST_DENIED'
    | 'INVALID_REQUEST'
    | 'UNKNOWN_ERROR';
}

@Component({
  selector: 'app-ridehistorydialog',
  templateUrl: './ridehistorydialog.component.html',
  styleUrls: ['./ridehistorydialog.component.css']
})
export class RidehistorydialogComponent implements OnInit {
  dataArray: any[] = [];
  // map: any =  google.maps.Map;
  map: any = null;
  polyline: any = null;
  startMarker: any = null;
  endMarker: any = null;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RidehistorydialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  

  ngOnInit(): void {
    this.dataArray = this.data;
    // console.log(this.dataArray)
    this.initMap();
    
  }


  initMap(): void {
    this.geocodeAddress(this.data.startLocation, (startLatLng) => {
      this.geocodeAddress(this.data.endLocation, (endLatLng) => {
        // Create a map centered at the start location
        const mapOptions: any = {
          center: startLatLng,
          zoom: 14,
        };
        this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

        // Draw a polyline between start and end locations
        this.drawPolyline(startLatLng, endLatLng);
      });
    });
  }  


  geocodeAddress(address: string, callback: (latLng: google.maps.LatLng) => void): void {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        const latLng: google.maps.LatLng = location;
        callback(latLng);
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }


  drawPolyline(startLatLng: google.maps.LatLng, endLatLng: google.maps.LatLng): void {
    // Create the polyline options
    const polylineOptions = {
      path: [startLatLng, endLatLng],
      geodesic: true,
      strokeColor: '#0048ff',
      strokeOpacity: 1.0,
      strokeWeight: 3,
    };

    // Draw the polyline on the map
    this.polyline = new google.maps.Polyline(polylineOptions);
    this.polyline.setMap(this.map);

    // Adjust map bounds to fit the polyline
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(startLatLng);
    bounds.extend(endLatLng);
    this.map.fitBounds(bounds);

    this.addMarker(startLatLng, 'Start Location');
    this.addMarker(endLatLng, 'End Location');

  }




  addMarker(latLng: google.maps.LatLng, title: string): void {
    const markerOptions = {
      position: latLng,
      map: this.map,
      title: title,
    };
    const marker = new google.maps.Marker(markerOptions);
    marker.setMap(this.map);

    // Store the marker in class properties for further use (if needed)
    if (title === 'Start Location') {
      this.startMarker = marker;
    } else if (title === 'End Location') {
      this.endMarker = marker;
    }
  }
}

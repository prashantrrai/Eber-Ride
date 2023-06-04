
// import { AfterViewInit, Component, OnInit } from '@angular/core';
// import { AuthService } from '../Service/auth.service';
// import { ToastrService } from 'ngx-toastr';

// declare const google: any;


// @Component({
//   selector: 'app-map',
//   templateUrl: './map.component.html',
//   styleUrls: ['./map.component.css']
// })

// export class MapComponent implements OnInit, AfterViewInit {
//   enteredLocation: string = '';
//   isLocationInZone: boolean = false;
//   message: string = '';
//   polygon: any;
//   map: any;

//   constructor(private authService: AuthService, private toastr: ToastrService) {}

//   ngOnInit() {}

//   ngAfterViewInit() {
//     this.initializeMap();
//   }

//   initializeMap() {
//     this.map = new google.maps.Map(document.getElementById('map'), {
//       center: { lat: 40.7128, lng: -74.0060 }, // Set the center coordinates
//       zoom: 12 // Set the initial zoom level
//     });

//     const drawingManager = new google.maps.drawing.DrawingManager({
//       drawingMode: google.maps.drawing.OverlayType.POLYGON, // Set the drawing mode to polygon
//       drawingControl: true,
//       drawingControlOptions: {
//         position: google.maps.ControlPosition.TOP_CENTER,
//         drawingModes: [google.maps.drawing.OverlayType.POLYGON]
//       },
//       map: this.map // Set the map object to enable drawing on the map
//     });

//     google.maps.event.addListener(drawingManager, 'polygoncomplete', (event: any) => {
//       if (this.polygon) {
//         this.polygon.setMap(null); // Clear previous polygon from the map
//       }
//       this.polygon = event.overlay;
//       this.logPolygonCoordinates(this.polygon);
//     });
//   }

//   checkLocationAgainstZone(location: any) {
//     if (this.polygon) {
//       const point = new google.maps.LatLng(location.lat(), location.lng());
//       this.isLocationInZone = google.maps.geometry.poly.containsLocation(point, this.polygon);

//       if (this.isLocationInZone) {
//         this.message = 'Yes, your entered location belongs to the drawn zone.';
//       } else {
//         this.message = 'Sorry, your entered location doesn’t belong to the drawn zone.';
//       }
//     } else {
//       this.message = 'Please draw a zone on the map.';
//     }
//   }

//   checkLocation() {
//     const geocoder = new google.maps.Geocoder();
//     const location = this.enteredLocation;

//     geocoder.geocode({ address: location }, (results: any, status: any) => {
//       if (status === 'OK') {
      
//         console.log('entered inside if OK......',status)

//         const resultLocation = results[0].geometry.location;

//         console.log('resultLocation......',resultLocation)
        


//         this.map.setCenter(resultLocation);
//         const marker = new google.maps.Marker({
//           position: resultLocation,
//           map: this.map
//         });

//         this.checkLocationAgainstZone(resultLocation);
//       } else {
//         console.log('Geocode was not successful for the following reason: ' + status);
//       }
//     });
//   }

//   logPolygonCoordinates(polygon: any) {
//     if (polygon && polygon.getPath) {
//       const coordinates = polygon.getPath().getArray();
//       console.log('Polygon Coordinates:', coordinates);
//     }
//   }

//   resetTimer() {
//     this.authService.resetInactivityTimer();
//   }
// }

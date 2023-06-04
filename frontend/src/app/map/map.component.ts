// import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

// declare const google: any;

// @Component({
//   selector: 'app-map',
//   templateUrl: './map.component.html',
//   styleUrls: ['./map.component.css']
// })
// export class MapComponent implements OnInit, AfterViewInit {
//   @ViewChild('mapContainer', { static: false })
//   mapContainer!: ElementRef;

//   map: any;
//   marker: any;
//   autocomplete: any;

//   ngOnInit() {
//     // this.initializeMap();
//     // this.initializeAutocomplete();
//   }

//     ngAfterViewInit() {
//     this.initializeMap();
//     this.initializeAutocomplete();
//   }

//   initializeMap() {
//     const mapOptions = {
//       center: new google.maps.LatLng(40.7128, -74.0060), // Set the center coordinates (e.g., New York City)
//       zoom: 12 // Set the initial zoom level
//     };
  
//     this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
  
//     // Show current location on page load
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition((position) => {
//         const currentLocation = new google.maps.LatLng(
//           position.coords.latitude,
//           position.coords.longitude
//         );
//         this.map.setCenter(currentLocation);
//         this.addMarker(currentLocation);
//       });
//     }
//   }

//   initializeAutocomplete() {
//     this.autocomplete = new google.maps.places.Autocomplete(this.searchInput.nativeElement);
//     this.autocomplete.addListener('place_changed', () => {
//       const place = this.autocomplete.getPlace();
//       if (place.geometry && place.geometry.location) {
//         const location = place.geometry.location;
//         this.map.setCenter(location);
//         this.addMarker(location);
//       }
//     });
//   }

//   addMarker(location: any) {
//     if (this.marker) {
//       this.marker.setMap(null);
//     }

//     this.marker = new google.maps.Marker({
//       position: location,
//       map: this.map,
//       draggable: true
//     });

//     google.maps.event.addListener(this.marker, 'dragend', () => {
//       this.updateAddress(this.marker.getPosition());
//     });
//   }

//   updateAddress(location: any) {
//     const geocoder = new google.maps.Geocoder();
//     geocoder.geocode({ location: location }, (results: any, status: any) => {
//       if (status === 'OK' && results[0]) {
//         console.log('Address:', results[0].formatted_address);
//       }
//     });
//   }

//   enteredLocation(value: string): void {
//     const query = value;
//     console.log(query);
//     // Implement the logic to search for places using Google API
//   }
  
//   selectLocation() {
//     const geocoder = new google.maps.Geocoder();
//     const location = this.enteredLocation;
    
//     geocoder.geocode({ address: location }, (results: any, status: any) => {
//       if (status === 'OK') {
//         const resultLocation = results[0].geometry.location;
//         this.map.setCenter(resultLocation);
//         this.addMarker(resultLocation);
//       } else {
//         console.log('Geocode was not successful for the following reason: ' + status);
//       }
//     });
//   }
// }





import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef;

  map: any;
  marker: any;
  autocomplete: any;
  enteredLocation: string = '';

  ngOnInit() {
    // this.initializeMap();
    // this.initializeAutocomplete();
  }

  ngAfterViewInit() {
    this.initializeMap();
    this.initializeAutocomplete();
  }

  initializeMap() {
    const mapOptions = {
      center: new google.maps.LatLng(40.7128, -74.0060), // Set the center coordinates (e.g., New York City)
      zoom: 12 // Set the initial zoom level
    };
  
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
  
    // Show current location on page load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        this.map.setCenter(currentLocation);
        this.addMarker(currentLocation);
      });
    }
  }

  initializeAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.enteredLocation);
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        this.map.setCenter(location);
        this.addMarker(location);
      }
    });
  }

  addMarker(location: any) {
    if (this.marker) {
      this.marker.setMap(null);
    }

    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      draggable: true
    });

    google.maps.event.addListener(this.marker, 'dragend', () => {
      this.updateAddress(this.marker.getPosition());
    });
  }

  updateAddress(location: any) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: location }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        console.log('Address:', results[0].formatted_address);
      }
    });
  }

  // EnteredLocation(value: string): void {
  //   this.enteredLocation = value;
  //   console.log(this.enteredLocation);
  //   // Implement the logic to search for places using Google API
  // }
  
  selectLocation() {
    const geocoder = new google.maps.Geocoder();
    const location = this.enteredLocation;
    console.log(location)
    
    geocoder.geocode({ address: location }, (results: any, status: any) => {
      if (status === 'OK') {
        const resultLocation = results[0].geometry.location;
        this.map.setCenter(resultLocation);
        this.addMarker(resultLocation);
      } else {
        console.log('Geocode was not successful for the following reason: ' + status);
      }
    });
  }
}
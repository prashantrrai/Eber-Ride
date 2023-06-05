

import { Component, ElementRef, ViewChild } from '@angular/core';
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {
  @ViewChild('searchBox', { static: false }) searchBox!: ElementRef;

  map: any;
  autocomplete: any;
  google: any;
  marker: any;

  ngOnInit() {
    this.initMap();
  }

  initMap() {
    // Initialize map
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 8
    });


    // Create autocomplete search box
    const input = document.getElementById('search-box') as HTMLInputElement;
    this.autocomplete = new (google as any).maps.places.Autocomplete(input);
    this.autocomplete.setFields(['geometry']);

    
  
    // Show current location on page load
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition((position) => {
  //       const currentLocation = new google.maps.LatLng(
  //         position.coords.latitude,
  //         position.coords.longitude
  //       );
  //       this.map.setCenter(currentLocation);
  //       this.addMarker(currentLocation);
  //     });
  //   }
  // }


this.marker = new google.maps.Marker({
  map: this.map,
  draggable: true,
  animation: google.maps.Animation.DROP,
  anchorPoint: new google.maps.Point(0, -29)
});

this.marker.addListener('click', () => {
  this.toggleBounce();
});

this.marker.addListener('dragend', () => {
  const position = this.marker.getPosition();
  this.geocodeLatLng(position);
});


// Handle place selection
this.autocomplete.addListener('place_changed', () => {
  const place = this.autocomplete.getPlace();
  this.marker.setVisible(false);

  // Move map marker to selected location
  if (place.geometry && place.geometry.location) {
    this.map.setCenter(place.geometry.location);
    this.marker.setPosition(place.geometry.location);
    this.marker.setVisible(true);
  }
});
  }

  toggleBounce() {
    if (this.marker.getAnimation() !== null) {
      this.marker.setAnimation(null);
    } else {
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

  //update address or Location
  geocodeLatLng(position: any) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        const input = document.getElementById('search-box') as HTMLInputElement;
        input.value = address;
        console.log(address)
      }
    });
  }
}



//   selectLocation() {
//     const geocoder = new google.maps.Geocoder();
//     const location = this.enteredLocation;
//     console.log(location)
    
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








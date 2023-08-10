import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Service/auth.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from 'src/app/Service/drawer.service';
declare var google: any;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit,  AfterViewInit {
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  map: any;
  directionsService: any;
  directionsRenderer: any;
  
  constructor(
    private authService: AuthService, 
    private _drawerService: DrawerService,
    ){}

  ngOnInit(): void {
    this.authService.startInactivityTimer();
    this.initMap();
  }

  ngAfterViewInit() {
    this._drawerService.setDrawer(this.drawer);
  }


  
    // -------------------------------------INITIALIZE GOOGLE MAP-------------------------------------//
    initMap() {
      const rajkotLocation = { lat: 22.3039, lng: 70.8022 }; // Rajkot coordinates
      const ahmedabadLocation = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad coordinates
    
      this.map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
          zoom: 7,
          center: rajkotLocation,
        }
      );
    
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        polylineOptions: {
          strokeColor: "blue", // Set the route path color to blue
        },
      });
    
      // Set up directions request
      const request = {
        origin: rajkotLocation,
        destination: ahmedabadLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      };
    
      // Calculate and display directions
      this.directionsService.route(request, (response: any, status: any) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer.setDirections(response);
          const startMarker = new google.maps.Marker({
            position: rajkotLocation,
            map: this.map,
            title: "Start Location",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Blue marker
            },
          });
          const endMarker = new google.maps.Marker({
            position: ahmedabadLocation,
            map: this.map,
            title: "End Location",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Blue marker
            },
          });
        } else {
          window.alert("Directions request failed due to " + status);
        }
      });
    }
    
  

}
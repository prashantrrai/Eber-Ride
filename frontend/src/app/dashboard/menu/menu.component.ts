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
  }

  ngAfterViewInit() {
    this._drawerService.setDrawer(this.drawer);
  }
}
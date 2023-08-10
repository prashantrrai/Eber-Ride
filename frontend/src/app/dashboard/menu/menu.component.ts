import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationsService } from 'src/app/Service/notifications.service';
import { SocketService } from 'src/app/Service/socket.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from 'src/app/Service/drawer.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit,  AfterViewInit {
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  
  constructor(
    private authService: AuthService, 
    private _drawerService: DrawerService
    ){}

  ngOnInit(): void {
    this.authService.startInactivityTimer();
  }

  ngAfterViewInit() {
    this._drawerService.setDrawer(this.drawer);
  }


}
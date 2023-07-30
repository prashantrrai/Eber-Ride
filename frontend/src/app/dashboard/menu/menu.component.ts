import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationsService } from 'src/app/Service/notifications.service';
import { SocketService } from 'src/app/Service/socket.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  notificationCounter = 0;
  
  constructor(
    private router: Router,  
    private authService: AuthService, 
    private toastr: ToastrService,
    private _notification: NotificationsService,
    private _socket: SocketService
    ){}

  ngOnInit(): void {
    this.authService.startInactivityTimer();
    this.showDummyNotification()
  }


  //-------------------------------------ON MOUSE MOVE RESET TIMER---------------------------------//
  @HostListener('window:mousemove') // Add this event listener to the component
  onWindowMouseMove(): void {
    this.authService.resetInactivityTimer();
  }

  
  //---------------------------ON LOGOUT CLICK--------------------------------//
  onLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.toastr.info('Logged Out Successfully', 'Info');
    this.router.navigate(['/login']);
  }

  //---------------------TO CHECK NOTIFICATION--------------------------------//
  checkNotificationSupport(): void {
    const isSupported = this._notification.checkNotificationSupport();
    if (isSupported) {
      console.log('Notifications are supported in this browser.');
    } else {
      console.log('Notifications are not supported in this browser.');
    }
  }


  //-----------------------------------------TO SHOW NOTIFICATION ON CLICK----------------------------------------//
  showDummyNotification(): void {
    this.sendNotificationRequest()
    
    this.listenNotificationRequest()
  }



  //-------------------------------EMIT OR SEND NOTIFICATION REQUEST--------------------------//
  sendNotificationRequest(): void {
    this._notification.requestNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        this._socket.emitnotification();
      }
    });
  }

  //-------------------------------LISTEN OR RECEIVE NOTIFICATION REQUEST--------------------------//
  listenNotificationRequest(): void {
    this._socket.listeningnotification().subscribe((data: any) => {
      console.log(data);
      
      this.notificationCounter = data.notificationCounter
    });
  }

}

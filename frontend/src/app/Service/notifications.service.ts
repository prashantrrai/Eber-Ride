import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {


  constructor() { }

  //-----------------------TO CHECK NOTIFICATION IS SUPPORTED OR NOT--------------------------------//
  checkNotificationSupport(): boolean {
    return 'Notification' in window;
  }

  //-----------------------TO TAKE PERMISSION FROM BROWSER LIKE CHROME--------------------------------//
  requestNotificationPermission(): Promise<NotificationPermission> {
    return Notification.requestPermission();
  }

  //-----------------------TO SHOW NOTIFICATION ON CLICK--------------------------------//
  showDummyNotification(data: any): void {
    // console.log('Received push notification:', data);

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {

        const options: NotificationOptions = {
          body: data.message,
          icon: '../../assets/images/frontal-taxi-cab.png',
          // Add other notification options as needed
        };
        const notification = new Notification('Eber Ride', options);
        
      }
    }
  }


}

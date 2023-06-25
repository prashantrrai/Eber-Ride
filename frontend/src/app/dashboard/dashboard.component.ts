import { Component } from '@angular/core';
import { AuthService } from '../Service/auth.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  
})  
export class DashboardComponent {
  constructor(private authService: AuthService) {}

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}

import { Component, HostListener } from '@angular/core';
import { AuthService } from '../Service/auth.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  
})  
export class DashboardComponent {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.startInactivityTimer();
  }


  
  //-------------------------------------ON MOUSE MOVE RESET TIMER---------------------------------//
  @HostListener('window:mousemove') // Add this event listener to the component
  onWindowMouseMove(): void {
    this.authService.resetInactivityTimer();
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}

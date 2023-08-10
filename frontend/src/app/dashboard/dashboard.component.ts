import { Component, HostListener } from '@angular/core';
import { AuthService } from '../Service/auth.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  
})  
export class DashboardComponent {
  isDashboardRoute: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.authService.startInactivityTimer();
  }
  getroute(){
    this.route.data.subscribe(data => {
      this.isDashboardRoute = data['isDashboard'];
      console.log('isDashboardRoute:', this.isDashboardRoute);
    });
  }
  
  isDashboardRouting(): boolean {
    return this.route.snapshot.url[0].path === '/dashboard';
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

import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Service/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  
  constructor(private router: Router,  private authService: AuthService){}

  ngOnInit(): void {
    this.authService.startInactivityTimer();
  }

  @HostListener('window:mousemove') // Add this event listener to the component
  onWindowMouseMove(): void {
    this.authService.resetInactivityTimer();
  }

  
  onLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // alert('Logged out successfully');
    this.router.navigate(['/login']);
  }

}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private inactivityTimeout: any;

  constructor(private router: Router) { }
  
  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }


  startInactivityTimer(): void {
    this.inactivityTimeout = setTimeout(() => {
      this.logout();
    }, 20 * 60 * 1000); // 20 minutes in milliseconds
  }

  resetInactivityTimer(): void {
    clearTimeout(this.inactivityTimeout);
    this.startInactivityTimer();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') || !!sessionStorage.getItem('token');
  }

  deleteToken(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

}

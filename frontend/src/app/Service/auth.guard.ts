
// import { CanActivateFn, Router } from '@angular/router';

// import { Injectable } from "@angular/core";
// import { CanActivate, CanActivateChild, Router } from "@angular/router";
// import { AuthService } from './auth.service';

// export const authGuard: CanActivateFn = (route, state) => {

//   if (localStorage.getItem('token')) {
//     return true;
//   }

//   const email = route.queryParams['email']; 
//   const password = route.queryParams['password']; 

//   if (email === 'admin' && password === 'password'){
//     localStorage.setItem('token', 'your_token_value');
//     const router = new Router();
//     console.log("working")
//     router.navigate(['/dashboard']);
//     return true;
//   } else {
//     const router = new Router();
//     router.navigate(['/login']);
//     return false;
//   }
// };



import { Injectable } from "@angular/core";
import { CanActivate, CanActivateChild, Router } from "@angular/router";
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate, CanActivateChild{

  constructor(private authservice: AuthService, private router: Router) { }
  
  canActivate(): boolean {
    if (this.authservice.isLoggedIn()) {
      return true;
    }else{
      this.router.navigateByUrl('/');
      return false;
    }
  }

  canActivateChild(): boolean {
    if (this.authservice.isLoggedIn()) {
      return true;
    }else{
      this.router.navigateByUrl('/');
      return false;
    }}
    
}
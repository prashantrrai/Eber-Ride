import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  if (localStorage.getItem('token')) {
    return true;
  }

  const email = route.queryParams['email']; 
  const password = route.queryParams['password']; 

  if (email === 'admin' && password === 'password'){
    localStorage.setItem('token', 'your_token_value');
    const router = new Router();
    console.log("working")
    router.navigate(['/dashboard']);
    return true;
  } else {
    const router = new Router();
    router.navigate(['/login']);
    return false;
  }
};



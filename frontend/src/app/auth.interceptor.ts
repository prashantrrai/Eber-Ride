import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    let token ="Bearer "+ localStorage.getItem("token")

    let authReq = request.clone({
      setHeaders:{
        "Authorization": token
      }
    })

    return next.handle(authReq)

  }

}

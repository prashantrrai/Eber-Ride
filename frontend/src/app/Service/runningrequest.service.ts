import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class RunningrequestService {
  private socket: Socket;
  private url = 'http://localhost:4000'

  constructor(private http: HttpClient) {
    this.socket = io(this.url); 
   }

  rejectRunningRequest(driverId: string): Observable<any> {
    const url = `${this.url}/reject`; // Replace with your actual reject API endpoint
    return this.http.post(url, { driverId });
  }
}

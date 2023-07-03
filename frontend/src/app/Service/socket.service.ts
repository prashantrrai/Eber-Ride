import { Injectable } from '@angular/core';
import {  io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket
  constructor() { this.socket = io('http://localhost:4000');  }

}

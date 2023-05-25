import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  vehicleaddAPI = 'http://localhost:4000/vehicleadd'
  getVehicleAPI = 'http://localhost:4000/vehicledata'

  

  constructor(private http:HttpClient) { }

  //  registerVehicle(vehicleData : any){
  //  console.log(vehicleData);
  //  return this.http.post<any>(this.vehicleaddAPI , vehicleData)
  // }

  registerVehicle(val:any ){
    return this.http.post(this.vehicleaddAPI, val);
  }

  getvehicleData(){
    return this.http.get(this.getVehicleAPI)
  }
}

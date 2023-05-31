import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  vehicleaddAPI = 'http://localhost:4000/vehicleadd'
  getVehicleAPI = 'http://localhost:4000/vehicledata'
  updateVehicleAPI = 'http://localhost:4000/updateVehicle'

  

  constructor(private http:HttpClient) { }

  registerVehicle(vehicleData: FormData): Observable<any> {
    return this.http.post(this.vehicleaddAPI, vehicleData);
  }

  getvehicleData(): Observable<any> {
    return this.http.get(this.getVehicleAPI);
  }

  updateVehicle(vehicleId: string, vehicleData: any): Observable<any> {
    console.log(vehicleId)
    const url = `${this.updateVehicleAPI}/${vehicleId}`;
    return this.http.put<any>(url, vehicleData);
  }

}

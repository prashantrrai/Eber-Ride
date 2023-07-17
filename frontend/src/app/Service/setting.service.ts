import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  private serverUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) { }

  // addSetting(formValues: any) {
  //   console.log(formValues)
  //   return this.http.post<any>(`${this.serverUrl}/setting`, formValues);
  // }
  getStops() {
    return this.http.get<any>(`${this.serverUrl}/settingdata`);
  }
  updateSetting(formValues: any) {
    // console.log(formValues)
    return this.http.put<any>(`${this.serverUrl}/updatesetting`, formValues);
  }

}

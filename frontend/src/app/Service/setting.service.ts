import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  // private serverUrl = 'http://localhost:4000';
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';


  constructor(private http: HttpClient) { }

  // addSetting(formValues: any) {
  //   console.log(formValues)
  //   return this.http.post<any>(`${this.serverUrl}/setting`, formValues);
  // }
  get_setting_data() {
    return this.http.get<any>(`${this.serverUrl}/settingdata`);
  }
  updateSetting(formValues: any) {
    // console.log(formValues)
    return this.http.put<any>(`${this.serverUrl}/updatesetting`, formValues);
  }

  // getEnvData(): Observable<any> {
  //   return this.http.get<any>(`${this.serverUrl}/env`);
  // }

}

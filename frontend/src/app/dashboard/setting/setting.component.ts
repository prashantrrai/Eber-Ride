import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/Service/auth.service";
import { SettingService } from "src/app/Service/setting.service";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.css"],
})
export class SettingComponent {
  settingForm!: FormGroup;
  timeoutArray: any[] = [10, 20, 30, 45, 60, 90, 120];
  stopArray: any[] = [1, 2, 3, 4, 5];
  selectedTimeout: any =10 ;
  selectedStop: any =2 ;
  setting: any=[];
  id: any;
  credentials: any[] = [];
  EMAIL_PASSWORD: any;
  EMAIL_USER: any;
  accountSid: any;
  authToken: any;
  twilioPhoneNumber: any;
  STRIPE_Publishable_key: any;
  STRIPE_Secret_key: any;

  constructor(
    private _setting: SettingService,
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.settingForm = this.formBuilder.group({
      ridetimeout: [''],
      stop: ['']
    });

    this.settingForm.patchValue({
      ridetimeout: this.setting.ridetimeout
    });
  }

  ngOnInit(): void {
    this.getsettingData()
    this.getCredentials()

    this.settingForm = this.formBuilder.group({
      ridetimeout: ["", [Validators.required]],
      stop: ["", [Validators.required]],
    });
  }

  //---------------------UPDATE RIDE TIMEOUT----------------------//
  // onSelectedRideTimeout(ridetimeout: any) {
  //   this.selectedTimeout = ridetimeout;
  //   // console.log(ridetimeout);
  //   this._setting.updateSetting({ridetimeout:ridetimeout, id:this.id}).subscribe({
  //     next: (response: any) => {
  //       // console.log(response.settingdata);
  //       this.setting = response.settingdata;
  //       this.toastr.success(response.message);
  //     },
  //     error: (error: any) => {
  //       console.log(error);
  //       this.toastr.error(error.error.message);
  //     },
  //   });
  // }


  //---------------------UPDATE STOPS----------------------//
  // onSelectedStop(stop: any) {
  //   this.selectedStop = stop;
  //   // console.log(this.id);
  //   this._setting.updateSetting({stop: stop, id:this.id}).subscribe({
  //     next: (response: any) => {
  //       // console.log(response.settingdata);
  //       this.setting = response.settingdata;
  //       // console.log(this.setting)
  //       this.toastr.success(response.message);
  //     },
  //     error: (error: any) => {
  //       console.log(error);
  //       this.toastr.error(error.error.message);
  //     },
  //   });
  // }

  //---------------------GET SETTING DATA----------------------//
  getsettingData(){
    this._setting.getStops().subscribe({
      next: (response: any) => {
        // console.log(response);
        this.setting = response.settingData[0];
        this.id = response.settingData[0]._id
        // console.log(this.id)
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }


  //---------------------UPDATE RIDE TIMEOUT----------------------//
  onSubmit() {
    // this.selectedTimeout = ridetimeout;
    // this.selectedStop = stop;
    const formValues = {settingdata: this.settingForm.value, id:this.id};
    console.log('Form values:', formValues);

    this._setting.updateSetting(formValues).subscribe({
      next: (response: any) => {
        console.log(response.settingdata);
        this.setting = response.settingdata;
        this.toastr.success(response.message);
      },
      error: (error: any) => {
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }


  //----------------------------------GET CREDENTIALS FROM .ENV--------------------------------------//
  getCredentials(){
    this._setting.getEnvData().subscribe({
      next: (response: any) => {
        console.log(response);
        this.credentials = response
        this.EMAIL_USER = response.EMAIL_USER;
        this.EMAIL_PASSWORD = response.EMAIL_PASSWORD;
        this.accountSid = response.accountSid;
        this.authToken = response.authToken;
        this.twilioPhoneNumber = response.twilioPhoneNumber;
        this.STRIPE_Publishable_key = response.STRIPE_Publishable_key;
        this.STRIPE_Secret_key = response.STRIPE_Secret_key;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  //-------------------------------EXTRA COMMON CODE------------------------------------//
  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}

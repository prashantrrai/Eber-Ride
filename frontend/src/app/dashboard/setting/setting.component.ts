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
  selectedTimeout: any;
  selectedStop: any;
  setting: any=[];
  id: any;
  credentials: any[] = [];
  EMAIL_PASSWORD: any;
  EMAIL_USER: any;
  accountSid: any;
  authToken: any;
  twilioPhoneNumber: any;

  constructor(
    private _setting: SettingService,
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getsettingData()
    this.getCredentials()

    this.settingForm = this.formBuilder.group({
      ridetimeout: ["", [Validators.required]],
      stop: ["", [Validators.required]],
    });
  }

  //---------------------UPDATE RIDE TIMEOUT----------------------//
  onSelectedRideTimeout(ridetimeout: any) {
    this.selectedTimeout = ridetimeout;
    // console.log(ridetimeout);
    this._setting.updateSetting({ridetimeout:ridetimeout, id:this.id}).subscribe({
      next: (response: any) => {
        // console.log(response.settingdata);
        this.setting = response.settingdata;
        this.toastr.success(response.message);
      },
      error: (error: any) => {
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }


  //---------------------UPDATE STOPS----------------------//
  onSelectedStop(stop: any) {
    this.selectedStop = stop;
    // console.log(this.id);
    this._setting.updateSetting({stop: stop, id:this.id}).subscribe({
      next: (response: any) => {
        // console.log(response.settingdata);
        this.setting = response.settingdata;
        // console.log(this.setting)
        this.toastr.success(response.message);
      },
      error: (error: any) => {
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }

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

  // --------------------------------------------ADD TIMEOUT FXN---------------------------------------------
  // onSubmit(){
  //   const formValues = this.settingForm.value;
  //   console.log(formValues);

  //   if (this.settingForm.valid) {
  //     this._setting.addSetting(formValues).subscribe({
  //       next: (response: any) => {
  //         console.log(response);
  //         this.settingForm.reset();
  //         this.toastr.success(response.message);
  //       },
  //       error: (error: any) => {
  //         console.log(error.error.message);
  //         this.toastr.error(error.error.message);
  //       },
  //     });
  //   } else {
  //     this.toastr.warning("All Fields are Required");
  //   }
  // }



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

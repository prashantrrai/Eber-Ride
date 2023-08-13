import { Component } from "@angular/core";
import { FormBuilder, FormGroup,FormControl, Validators } from "@angular/forms";
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
  ridetimeout: any
  stop: any
  id: any;
  credentials: any[] = [];
  EMAIL_PASSWORD: any;
  EMAIL_USER: any;
  accountSid: any;
  authToken: any;
  twilioPhoneNumber: any;
  STRIPE_Publishable_key: any;
  STRIPE_Secret_key: any;
  settingdata: any;

  constructor(
    private _setting: SettingService,
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getsettingData()
  }

  //----------------------initializeForm DATA----------------------//
  initializeForm(): void {
    this.settingForm = this.formBuilder.group({
      ridetimeout: ["", [Validators.required]],
      stop: ["", [Validators.required]],
      EMAIL_USER: ["", [Validators.required]],
      EMAIL_PASSWORD: ["", [Validators.required]],
      accountSid: ["", [Validators.required]],
      authToken: ["", [Validators.required]],
      twilioPhoneNumber: ["", [Validators.required]],
      STRIPE_Publishable_key: ["", [Validators.required]],
      STRIPE_Secret_key: ["", [Validators.required]],
    });
  }

  //---------------------GET SETTING DATA----------------------//
  getsettingData(){
    this._setting.get_setting_data().subscribe({
      next: (response: any) => {
        console.log(response)
        this.settingdata = response
        this.id = response[0]._id
        
        
        this.settingForm.patchValue({
          ridetimeout: response[0].ridetimeout,
          stop: response[0].stop,
          EMAIL_USER: response[0].EMAIL_USER,
          EMAIL_PASSWORD: response[0].EMAIL_PASSWORD,
          accountSid: response[0].accountSid,
          authToken: response[0].authToken,
          twilioPhoneNumber: response[0].twilioPhoneNumber,
          STRIPE_Publishable_key: response[0].STRIPE_Publishable_key,
          STRIPE_Secret_key: response[0].STRIPE_Secret_key,
        });
      },
      error: (error: any) => {  
        console.log(error);
      },
    });
  }

  
  //---------------------UPDATE SETTING DATA----------------------//
  onSubmit() {
    console.log(this.settingForm.value)
    const formData = {
      settingdata: this.settingForm.value, 
      id:this.id
    };

    if(this.settingForm.valid){
      
      this._setting.updateSetting(formData).subscribe({
        next: (response: any) => {
          console.log(response);

          this.settingdata = response
          this.toastr.success(response.message);
          this.getsettingData()
        },  
        error: (error: any) => {
          console.log(error);
          this.toastr.error(error.error.message);
        },
      });
    }else{
      this.toastr.warning("All Fields Required");
      console.log("All Fields Required");
    }
  }


  //----------------------------------GET CREDENTIALS FROM .ENV--------------------------------------//
  // getCredentials(){
  //   this._setting.getEnvData().subscribe({
  //     next: (response: any) => {
  //       console.log(response);
  //       this.credentials = response
  //       this.EMAIL_USER = response.EMAIL_USER;
  //       this.EMAIL_PASSWORD = response.EMAIL_PASSWORD;
  //       this.accountSid = response.accountSid;
  //       this.authToken = response.authToken;
  //       this.twilioPhoneNumber = response.twilioPhoneNumber;
  //       this.STRIPE_Publishable_key = response.STRIPE_Publishable_key;
  //       this.STRIPE_Secret_key = response.STRIPE_Secret_key;
  //     },
  //     error: (error: any) => {
  //       console.log(error);
  //     },
  //   });
  // }

  //-------------------------------EXTRA COMMON CODE------------------------------------//
  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}


    // console.log(this.settingdata);
    // this.settingForm.patchValue({
    //     ridetimeout: this.settingdata.settingData[0].ridetimeout,
    //     stop: this.settingdata.settingData[0].stop,
    //     EMAIL_USER: this.settingdata.envData.EMAIL_USER,
    //     EMAIL_PASSWORD: this.settingdata.envData.EMAIL_PASSWORD,
    //     accountSid: this.settingdata.envData.accountSid,
    //     authToken: this.settingdata.envData.authToken,
    //     twilioPhoneNumber: this.settingdata.envData.twilioPhoneNumber,
    //     STRIPE_Publishable_key: this.settingdata.envData.STRIPE_Publishable_key,
    //     STRIPE_Secret_key: this.settingdata.envData.STRIPE_Secret_key,
    // });
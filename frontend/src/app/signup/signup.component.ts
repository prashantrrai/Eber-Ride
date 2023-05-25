import { Component, OnInit } from '@angular/core';
import {  FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../Service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  myForm!: FormGroup;

  constructor(private formbuilder: FormBuilder, private _api: ApiService, private _router : Router) {}



  ngOnInit(): void {
    this.myForm = this.formbuilder.group({
      adminName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      cnfpassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  // personDataArray: any[] = [{ name: 'Prashant Rai', email: 'prashant@gmail.com', password: 'sdkadhdif' }];


  submitForm() {
    // console.log(this.myForm)
    if (this.myForm.valid) {
      const personData = this.myForm.value;
      // console.log(personData);
      // this.personDataArray.push(personData);

      this._api.registerUser(personData).subscribe((res) => {
        alert('Registration Successful');
        // console.log("This is response from database.........",res)
        // this._api.personDataArray.push(res);
        this.myForm.reset();
        this._router.navigate(['/login'])
      })

    }
    else if(this.myForm.invalid){
      alert('Please fill proper Credentials');
    }
    else{
      alert('All Fields are Required');
    }
  }

}

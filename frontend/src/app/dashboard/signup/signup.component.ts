import { Component, OnInit } from '@angular/core';
import {  FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../Service/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  myForm!: FormGroup;

  constructor(private formbuilder: FormBuilder, private _api: ApiService, private _router : Router, private toastr: ToastrService) {}



  ngOnInit(): void {
    this.myForm = this.formbuilder.group({
      adminName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      cnfpassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }


  submitForm() {
    if (this.myForm.valid) {
      const personData = this.myForm.value;
      console.log(personData)
      this._api.registerUser(personData).subscribe({
      next:  (res) => {
        this.myForm.reset();
        this.toastr.success(res.message);
        this._router.navigate(['/login'])
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(error.error.message);
      }
    })
    }
    else{
      this.toastr.warning('All Fields are Required');
    }
  }
  

}

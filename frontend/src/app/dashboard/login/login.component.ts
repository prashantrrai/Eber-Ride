import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/api.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private _api: ApiService, private _router: Router, private formBuilder: FormBuilder, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get formControls() {
    return this.loginForm.controls;
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this._api.loginUser({ email, password }).subscribe({
       next: (res: any) => {
        const token = res.token;
          sessionStorage.setItem('token', token);
          localStorage.setItem("token",res.token)
          this.loginForm.reset();
          this.toastr.success(res.message, 'Success');
          this._router.navigate(['/app/dashboard']);
        },
       error: (error) => {
         console.log(error);
         this.toastr.error(error.error.message);
        }
      }
      );
    } else {
      this.toastr.warning('All Fields are required.');
    }
  }

  

}



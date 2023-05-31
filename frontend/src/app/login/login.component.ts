import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Service/api.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private _api: ApiService, private _router: Router, private formBuilder: FormBuilder) {}

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
        const token = 'your_token_value';
          localStorage.setItem("token",res.token)
          alert('Login Successful');
          this.loginForm.reset();
          this._router.navigate(['/dashboard']);
        },
       error: (error) => {
          alert('Login Failed');
          console.log(error);
        }
      }
      );
    } else {
      alert('All fields are required');
    }
  }

  

}



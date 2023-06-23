import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { LoginComponent } from '../dashboard/login/login.component';
import { SignupComponent } from '../dashboard/signup/signup.component';
import { ForgotpasswordComponent } from '../dashboard/forgotpassword/forgotpassword.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

const route :  Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'login'},
  {path:'login',component:LoginComponent},
  {path:'signup',component:SignupComponent},
  {path:'forgotpassword',component:ForgotpasswordComponent}
]

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    SignupComponent,
    ForgotpasswordComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
    
  ]
})
export class AuthModule { }

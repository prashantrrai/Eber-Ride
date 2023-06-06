import { MenuComponent } from './menu/menu.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { AdminComponent } from './admin/admin.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { authGuard } from './Service/auth.guard';
import { CountryComponent } from './country/country.component';
import { CityComponent } from './city/city.component';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'forgotpassword', component: ForgotpasswordComponent},
  {path: 'dashboard', component: MenuComponent , canActivate: [authGuard],  children :[
    {path: 'admin', component: AdminComponent},
    {path: 'vehicletype', component: VehicleComponent} ,   
    {path: 'country', component: CountryComponent},
    {path: 'city', component: CityComponent}   
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

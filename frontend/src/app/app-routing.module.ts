import { MenuComponent } from './components/menu/menu.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import { AdminComponent } from './components/admin/admin.component';
import { VehicleComponent } from './components/vehicle/vehicle.component';
import { authGuard } from './Service/auth.guard';
import { CountryComponent } from './components/country/country.component';
import { CityComponent } from './components/city/city.component';
import { UsersComponent } from './components/users/users.component';
import { DriverComponent } from './components/driver/driver.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { SettingComponent } from './components/setting/setting.component';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'forgotpassword', component: ForgotpasswordComponent},
  {path: 'dashboard', component: MenuComponent , canActivate: [authGuard],  children :[
    {path: 'admin', component: AdminComponent},
    {path: 'vehicletype', component: VehicleComponent} ,   
    {path: 'country', component: CountryComponent},
    {path: 'city', component: CityComponent}   ,
    {path: 'users', component: UsersComponent},
    {path: 'driver', component: DriverComponent},
    {path: 'vehiclepricing', component: PricingComponent},
    {path: "setting", component: SettingComponent}
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

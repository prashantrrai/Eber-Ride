import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';


import { CommonModule } from '@angular/common';
import { authGuard } from '../Service/auth.guard';

const routes: Routes = [

  {
    path: 'app',
    component: DashboardComponent,
    canActivateChild: [authGuard],
    children:[
      {path:'dashboard',loadChildren:()=>import('./home/home.module').then(m=>m.HomeModule)},
      {path:'admin',loadChildren:()=>import('./admin/admin.module').then(m=>m.AdminModule)},
      {path:'city',loadChildren:()=>import('./city/city.module').then(m=>m.CityModule)},
      {path:'country',loadChildren:()=>import('./country/country.module').then(m=>m.CountryModule)},
      {path:'driver',loadChildren:()=>import('./driver/driver.module').then(m=>m.DriverModule)},
      {path:'vehiclepricing',loadChildren:()=>import('./pricing/pricing.module').then(m=>m.PricingModule)},
      {path:'setting',loadChildren:()=>import('./setting/setting.module').then(m=>m.SettingModule)},
      {path:'users',loadChildren:()=>import('./users/users.module').then(m=>m.UsersModule)},
      {path:'vehicletype',loadChildren:()=>import('./vehicle/vehicle.module').then(m=>m.VehicleModule)},
      {path:'createride',loadChildren:()=>import('./createride/createride.module').then(m=>m.CreaterideModule)},
      {path:'confirmride',loadChildren:()=>import('./confirmride/confirmride.module').then(m=>m.ConfirmrideModule)},
      {path: "runningrequest", loadChildren:() => import('./runningrequest/runningrequest.module').then(m=>m.RunningrequestModule)},
      { path: 'ridehistory', loadChildren: () => import('./ridehistory/ridehistory.module').then(m => m.RidehistoryModule) },
      {path: 'payment' , loadChildren: () => import('./trip-end/trip-end.module').then(m => m.TripEndModule)},
      { path: 'stripe', loadChildren: () => import('./stripe/stripe.module').then(m => m.StripeModule) },
    ]
  },



];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }

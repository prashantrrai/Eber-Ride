import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RidehistoryRoutingModule } from './ridehistory-routing.module';
import { RidehistoryComponent } from './ridehistory.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

const routes: Routes = [  
  { path: '', component: RidehistoryComponent, pathMatch: 'full' }
];


@NgModule({
  declarations: [
    RidehistoryComponent
  ],
  imports: [
    CommonModule,
    RidehistoryRoutingModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class RidehistoryModule { }

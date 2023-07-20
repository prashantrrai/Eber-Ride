import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RidehistoryRoutingModule } from './ridehistory-routing.module';
import { RidehistoryComponent } from './ridehistory.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCsvParserModule } from 'ngx-csv-parser';

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
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    // NgxCsvParserModule
    // MatIconModule,
    
    
    
  ]
})
export class RidehistoryModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TripEndRoutingModule } from './trip-end-routing.module';
import { TripEndComponent } from './trip-end.component';


@NgModule({
  declarations: [
    TripEndComponent
  ],
  imports: [
    CommonModule,
    TripEndRoutingModule
  ]
})
export class TripEndModule { }

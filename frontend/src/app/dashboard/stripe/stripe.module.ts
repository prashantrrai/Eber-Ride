import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StripeRoutingModule } from './stripe-routing.module';
import { StripeComponent } from './stripe.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material-module';


@NgModule({
  declarations: [
    StripeComponent
  ],
  imports: [
    CommonModule,
    StripeRoutingModule,
    MatDialogModule,
    MaterialModule
  ]
})
export class StripeModule { }

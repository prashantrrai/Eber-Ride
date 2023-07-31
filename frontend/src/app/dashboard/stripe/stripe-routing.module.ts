import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StripeComponent } from './stripe.component';

const routes: Routes = [{ path: '', component: StripeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StripeRoutingModule { }

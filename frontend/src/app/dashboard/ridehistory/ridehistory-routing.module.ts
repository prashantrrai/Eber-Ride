import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RidehistoryComponent } from './ridehistory.component';

const routes: Routes = [{ path: '', component: RidehistoryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RidehistoryRoutingModule { }

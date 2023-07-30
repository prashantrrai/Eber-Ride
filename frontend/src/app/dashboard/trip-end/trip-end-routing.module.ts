import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TripEndComponent } from './trip-end.component';

const routes: Routes = [{ path: '', component: TripEndComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TripEndRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RunningrequestComponent } from './runningrequest.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [  
  { path: '', component: RunningrequestComponent, pathMatch: 'full' }
];


@NgModule({
  declarations: [
    RunningrequestComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class RunningrequestModule { }

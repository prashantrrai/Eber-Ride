import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmrideComponent } from './confirmride.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [  
  { path: '', component: ConfirmrideComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [
    ConfirmrideComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ]
})
export class ConfirmrideModule { }

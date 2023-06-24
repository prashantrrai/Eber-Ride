import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreaterideComponent } from './createride.component';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

const routes : Routes = [{ path : "" , component : CreaterideComponent , pathMatch : "full"}]

@NgModule({
  declarations: [
    CreaterideComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ]
})
export class CreaterideModule { }

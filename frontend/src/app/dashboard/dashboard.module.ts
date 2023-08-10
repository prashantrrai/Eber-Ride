import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { MaterialModule } from '../material-module';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';

const routes : Routes = [{ path : "" , component : DashboardComponent , pathMatch : "full"}]


@NgModule({
  declarations: [
    DashboardComponent,
    MenuComponent, 
    FooterComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
  ]
})
export class DashboardModule { }

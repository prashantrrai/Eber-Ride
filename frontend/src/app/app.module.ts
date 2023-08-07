import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { AuthInterceptor } from './auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './Service/auth.service';
import { MaterialModule } from './material-module';
import { ToastrModule } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { SuccessDialogComponent } from './shared/success-dialog/success-dialog.component';
import { InfoDialogComponent } from './shared/info-dialog/info-dialog.component';
import { AssignDriverComponent } from './shared/assign-driver/assign-driver.component';
import { RidehistorydialogComponent } from './shared/ridehistorydialog/ridehistorydialog.component';
import { NotificationsService } from './Service/notifications.service';
import { FeedbackComponent } from './shared/feedback/feedback.component';

@NgModule({
  declarations: [
    AppComponent,
    SuccessDialogComponent,
    InfoDialogComponent,
    AssignDriverComponent,
    RidehistorydialogComponent,
    FeedbackComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    ToastrModule.forRoot(),
    DashboardModule,
    AuthModule,
    
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass:AuthInterceptor, multi:true}, AuthService, NotificationsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
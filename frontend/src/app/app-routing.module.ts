import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { authGuard } from "./Service/auth.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "app",
    canActivate: [authGuard],
    loadChildren: () =>
    import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
  },
  { 
    path: "",
    loadChildren: () =>
    import("./auth/auth.module").then((m) => m.AuthModule),
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

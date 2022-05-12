import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ApplicationsComponent} from './applications/applications.component';
import {SettingsComponent} from './settings/settings.component';
import {OverviewComponent} from './applications/overview/overview.component';
import {DependenciesComponent} from './applications/dependencies/dependencies.component';
import {EndpointsComponent} from './applications/endpoints/endpoints.component';
import {FunctionEditComponent} from './applications/functions/edit/function-edit.component';
import {FunctionsComponent} from './applications/functions/functions.component';
import {EndpointEditComponent} from './applications/endpoints/edit/endpoint-edit.component';
import {LoggedInGuard} from './auth/logged-in.guard.service';
import {AuthenticateOption, LoginComponent} from './login/login.component';
import {LoggedOutGuard} from './auth/logged-out.guard.service';

const routes: Routes = [
  {path: '', redirectTo: 'applications', pathMatch: 'full'},
  {path: 'login', component: LoginComponent, canActivate: [LoggedOutGuard], data: {option: AuthenticateOption.LOG_IN}},
  {path: 'signup', component: LoginComponent, canActivate: [LoggedOutGuard], data: {option: AuthenticateOption.SIGN_UP}},
  {path: 'settings', component: SettingsComponent, canActivate: [LoggedInGuard]},
  {path: 'applications', component: ApplicationsComponent, canActivate: [LoggedInGuard]},
  {
    path: 'applications/:id',
    children: [
      {path: 'overview', component: OverviewComponent},
      {path: 'dependencies', component: DependenciesComponent},
      {path: 'functions', component: FunctionsComponent},
      {path: 'functions/:functionId/edit', component: FunctionEditComponent},
      {path: 'endpoints', component: EndpointsComponent},
      {path: 'endpoints/:endpointId/edit', component: EndpointEditComponent}
    ],
    canActivate: [LoggedInGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

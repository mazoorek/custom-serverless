import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ApplicationsComponent} from './applications/applications.component';
import {SettingsComponent} from './settings/settings.component';
import {OverviewComponent} from './applications/overview/overview.component';
import {DependenciesComponent} from './applications/dependencies/dependencies.component';
import {EndpointsComponent} from './applications/endpoints/endpoints.component';
import {FunctionEditComponent} from './applications/functions/edit/function-edit.component';
import {FunctionsComponent} from './applications/functions/functions.component';

const routes: Routes = [
  {path: '', component: ApplicationsComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'applications', component: ApplicationsComponent},
  {
    path: 'applications/:id', children: [
      {path: 'overview', component: OverviewComponent},
      {path: 'dependencies', component: DependenciesComponent},
      {path: 'endpoints', component: EndpointsComponent},
      {path: 'functions', component: FunctionsComponent},
      {path: 'functions/:functionId/edit', component: FunctionEditComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

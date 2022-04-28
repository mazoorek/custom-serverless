import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './main/main.component';
import {ApplicationsComponent} from './applications/applications.component';
import {SettingsComponent} from './settings/settings.component';
import {OverviewComponent} from './applications/overview/overview.component';
import {DependenciesComponent} from './applications/dependencies/dependencies.component';
import {EndpointsComponent} from './applications/endpoints/endpoints.component';
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
    ]
  },
  {path: 'test', component: MainComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

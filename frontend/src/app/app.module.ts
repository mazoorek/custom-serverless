import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs';
import {MonacoEditorModule} from 'ngx-monaco-editor';
import {LoginComponent} from './login/login.component';
import {ApplicationsComponent} from './applications/applications.component';
import {SettingsComponent} from './settings/settings.component';
import {OverviewComponent} from './applications/overview/overview.component';
import {DependenciesComponent} from './applications/dependencies/dependencies.component';
import {EndpointsComponent} from './applications/endpoints/endpoints.component';
import {FunctionsComponent} from './applications/functions/functions.component';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {ApplicationsPopupComponent} from './popup/applications-popup.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    ApplicationsComponent,
    SettingsComponent,
    OverviewComponent,
    DependenciesComponent,
    EndpointsComponent,
    FunctionsComponent,
    ApplicationsPopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MonacoEditorModule.forRoot(),
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatPaginatorModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

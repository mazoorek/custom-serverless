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
import {FunctionEditComponent} from './applications/functions/edit/function-edit.component';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {DeletePopupComponent} from './popup/delete-popup.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {FunctionsComponent} from './applications/functions/functions.component';
import {MatCheckboxModule} from '@angular/material/checkbox';

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
    FunctionEditComponent,
    DeletePopupComponent,
    FunctionsComponent
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
        MatDialogModule,
        MatCardModule,
        MatCheckboxModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

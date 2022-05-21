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
import {EndpointEditComponent} from './applications/endpoints/edit/endpoint-edit.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import {reducers} from './store/app.reducers';
import {LoggedInGuard} from './login/logged-in.guard.service';
import {LoggedOutGuard} from './login/logged-out.guard.service';
import { EffectsModule } from '@ngrx/effects';
import {UserEffects} from './store/user/user.effects';
import {ApplicationsResolver} from './applications/applications.resolver';
import {ApplicationsEffects} from './store/applications/applications.effects';
import {ApplicationResolver} from './applications/application.resolver';
import {EndpointResolver} from './applications/endpoints/endpoint.resolver';
import {FunctionResolver} from './applications/functions/function.resolver';
import {ForgotPasswordPopupComponent} from './popup/forgot-password-popup.component';
import {PasswordResetComponent} from './user/password-reset/password-reset.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    PasswordResetComponent,
    ApplicationsComponent,
    SettingsComponent,
    OverviewComponent,
    DependenciesComponent,
    EndpointsComponent,
    FunctionEditComponent,
    DeletePopupComponent,
    ForgotPasswordPopupComponent,
    FunctionsComponent,
    EndpointEditComponent,
    NotFoundComponent
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
        MatCheckboxModule,
        StoreModule.forRoot(reducers),
        StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
        EffectsModule.forRoot([UserEffects, ApplicationsEffects]),
        MatProgressSpinnerModule
    ],
  providers: [LoggedInGuard, LoggedOutGuard, ApplicationsResolver, ApplicationResolver, EndpointResolver, FunctionResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }

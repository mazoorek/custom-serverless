import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth/auth.service';
import {AuthenticateOption} from './login/login.component';
import {SidebarService} from './dashboard/sidebar/sidebar.service';
import {select, Store} from '@ngrx/store';
import {isLoggedIn} from './store/user/user.selectors';
import {AppState} from './store/app.reducers';

@Component({
  selector: 'app-root',
  template: `
    <header class="header">
      <nav class="nav"><a class="nav__el" href="/">Custom serverless</a></nav>
      <nav class="nav">
        <ng-container *ngIf="isLoggedOut$ | async">
          <a class="nav__el" (click)="onLogInClicked()">Log in</a>
          <a class="nav__el" (click)="onSignUpClicked()">Sign up</a>
        </ng-container>
        <ng-container *ngIf="isLoggedIn$ | async">
          <a class="nav__el" (click)="onLogOutClicked()">Log out</a>
        </ng-container>
      </nav>
    </header>
    <ng-container *ngIf="isLoggedOut$ | async">
      <login [authenticateOption]="authenticateOption"></login>
    </ng-container>
    <ng-container *ngIf="isLoggedIn$ | async">
      <dashboard>
        <router-outlet></router-outlet>
      </dashboard>
    </ng-container>
  `,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  authenticateOption: AuthenticateOption = AuthenticateOption.LOG_IN;

  isLoggedIn$: Observable<boolean> | undefined;
  isLoggedOut$: Observable<boolean> | undefined;

  constructor(private authService: AuthService, private  sidebarService: SidebarService, private store: Store<AppState>) {
  }

  ngOnInit(): void {
    this.isLoggedIn$ = this.store.pipe(
      select(isLoggedIn)
    );
    this.isLoggedOut$ =  this.isLoggedIn$.pipe(
      select(isLoggedIn => !isLoggedIn)
    );
  }

  onLogInClicked(): void {
    this.authenticateOption = AuthenticateOption.LOG_IN;
  }

  onSignUpClicked(): void {
    this.authenticateOption = AuthenticateOption.SIGN_UP;
  }

  onLogOutClicked(): void {
    this.authenticateOption = AuthenticateOption.LOG_IN;
    this.authService.logout().subscribe();
  }
}

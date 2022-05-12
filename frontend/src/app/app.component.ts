import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth/auth.service';
import {AuthenticateOption} from './login/login.component';
import {SidebarService} from './dashboard/sidebar/sidebar.service';
import {select, Store} from '@ngrx/store';
import {isLoggedIn, isLoggedOut} from './store/user/user.selectors';
import {AppState} from './store/app.reducers';
import {Router} from '@angular/router';
import {UserActions} from './store/user';

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
      <router-outlet></router-outlet>
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
export class AppComponent {

  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;

  constructor(private authService: AuthService, private  sidebarService: SidebarService, private store: Store<AppState>,
              private router: Router) {
    console.log('startuje');
    this.store.dispatch(UserActions.fetchUserStart());
    this.isLoggedIn$ = this.store.pipe(
      select(isLoggedIn)
    );
    this.isLoggedOut$ =  this.store.pipe(
      select(isLoggedOut)
    );
  }

  onLogInClicked(): void {
    this.router.navigate([`/login`]);
  }

  onSignUpClicked(): void {
    this.router.navigate([`/signup`]);
  }

  onLogOutClicked(): void {
    this.authService.logout().subscribe(_ =>  this.router.navigate([`/login`]));
  }
}

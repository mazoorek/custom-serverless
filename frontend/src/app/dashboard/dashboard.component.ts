import {Component, OnInit} from '@angular/core';
import {SidebarOption} from './sidebar/sidebar.model';
import {SidebarService} from './sidebar/sidebar.service';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'dashboard',
  template: `
    <main class="main">
      <div class="user-view">
        <nav class="user-view__menu">
          <ul class="side-nav">
            <li *ngFor="let option of sidebarOptions" [class.side-nav--active]="isTabActive(option.url)">
              <a (click)="navigate(option.url)">{{option.name}}</a>
            </li>
          </ul>
        </nav>
        <div class="user-view__content">
          <div>
            <mat-icon (click)="goBack()" *ngIf="isNotRootLevelMenu()" class="back-arrow mat-elevation-z8">
              keyboard_backspace
            </mat-icon>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    </main>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sidebarOptions: SidebarOption[] = [];

  constructor(private sidebarService: SidebarService, private router: Router) {
  }

  ngOnInit(): void {
    this.sidebarOptions = this.sidebarService.getDashboardOptions();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.sidebarOptions = this.sidebarService.getDashboardOptions();
      }
    });
  }

  isTabActive(optionUrl: string): boolean {
    const lastUrlSegment = this.router.url.split("/").pop();
    return optionUrl === lastUrlSegment;
  }

  goBack(): void {
    this.router.navigate(this.router.url.substring(1).split('/').slice(0, -2));
  }

  isNotRootLevelMenu(): boolean {
    return /\/applications\/.+/.test(this.router.url);
  }


  navigate(url: string): void {
    if (this.isNotRootLevelMenu()) {
      // let parentPath = this.router.url.match(/\/applications\/.+\//)![0];
      // this.router.navigate([`${parentPath}/${url}`]);
      this.router.navigate([...this.router.url.substring(1).split('/').slice(0, 2), url]);
    } else {
      this.router.navigate([`/${url}`]);
    }
  }
}

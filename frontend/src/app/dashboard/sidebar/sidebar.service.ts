import {Injectable} from '@angular/core';
import {SidebarOption} from './sidebar.model';
import {Router} from '@angular/router';

@Injectable({providedIn: "root"})
export class SidebarService {

  constructor(private router: Router) {
  }

  getDashboardOptions(): SidebarOption[] {
    if(/\/applications\/.+/.test(this.router.url)) {
      return this.getApplicationDashboardOptions();
    } else {
      return this.getMainDashboardOptions();
    }
  }

  getMainDashboardOptions(): SidebarOption[] {
    return [
      {
        name: 'APPLICATIONS',
        url: 'applications'
      },
      {
        name: 'SETTINGS',
        url: 'settings'
      }
    ];
  }

  getApplicationDashboardOptions(): SidebarOption[] {
    return [
      {
        name: 'OVERVIEW',
        url: 'overview'
      },
      {
        name: 'DEPENDENCIES',
        url: 'dependencies'
      },
      {
        name: 'ENDPOINTS',
        url: 'endpoints'
      },
      {
        name: 'FUNCTIONS',
        url: 'functions'
      }
    ];
  }
}

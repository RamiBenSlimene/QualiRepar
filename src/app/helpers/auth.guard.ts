import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { DataStore } from './data.store';
import { RoutesPaths } from '../enums/RoutesPath';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly store : DataStore
  ) {}

  canActivate(): boolean {
    const key = this.store.getKey();
    if (key) {
      return true;
    } else {
      this.router.navigate([RoutesPaths.LOGIN]);
      return false;
    }
  }
}

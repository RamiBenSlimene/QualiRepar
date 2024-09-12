import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoutesPaths } from 'src/app/enums/RoutesPath';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent {

  constructor(private readonly router: Router) { }

  onCreate() {
    this.router.navigate([`${RoutesPaths.CLAIM}/${RoutesPaths.REQUEST}`]);
  }

  follow() {
    this.router.navigate([`${RoutesPaths.CLAIM}/${RoutesPaths.LIST}`]);
  }

}

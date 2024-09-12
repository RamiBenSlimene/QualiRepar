import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoutesPaths } from 'src/app/enums/RoutesPath';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {

  constructor(private readonly router: Router) { }

  onCreate() {
    this.router.navigate([RoutesPaths.CALCULAE_SUPPORT]);
  }

}

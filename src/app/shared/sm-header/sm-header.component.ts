import { Component, OnInit } from '@angular/core';
import { RoutesPaths } from 'src/app/enums/RoutesPath';

@Component({
  selector: 'app-sm-header',
  templateUrl: './sm-header.component.html',
  styleUrls: ['./sm-header.component.scss'],
})
export class SmHeaderComponent {

  routesPaths = RoutesPaths;

  constructor() { }

  logout() {
     localStorage.clear()
     sessionStorage.clear()
  }

}

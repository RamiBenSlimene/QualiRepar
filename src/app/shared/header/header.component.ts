import { Component } from '@angular/core';
import { RoutesPaths } from 'src/app/enums/RoutesPath';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  routesPaths = RoutesPaths;
  toogle : boolean = false;
  isActive : boolean = true;
  constructor() { }

  logout() {
     localStorage.clear();
     sessionStorage.clear();
  }
  toogleMenu(){
    this.toogle = !this.toogle;
}
closeMenu(){
  this.toogle = false;
}
}

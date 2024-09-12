import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { CalculateSupportComponent } from './views/calculate-support/calculate-support.component';
import { RoutesPaths } from './enums/RoutesPath';
import { SuccessComponent } from './views/success/success.component';
import { AuthGuard } from './helpers/auth.guard';
import { CreateClaimComponent as CREATE_CLAIM_WEB } from './web-views/create-claim/create-claim.component';
import { GetSupportComponent } from './web-views/get-support/get-support.component';
import { ClaimListComponent } from './web-views/claim-list/claim-list.component';
import { ClaimUpdateComponent } from './web-views/claim-update/claim-update.component';
import { ClaimDetailsComponent } from './web-views/claim-details/claim-details.component';

const routes: Routes = [
  {
    path: RoutesPaths.LOGIN,
    component: LoginComponent
  },
  {
    path:`${ RoutesPaths.CLAIM}/${RoutesPaths.REQUEST}`,
    canActivate: [AuthGuard],
    component: GetSupportComponent
  },
  {
    path:`${ RoutesPaths.CLAIM}/${RoutesPaths.LIST}`,
    canActivate: [AuthGuard],
    component: ClaimListComponent
  },
  {
    path:`${ RoutesPaths.CLAIM}/${RoutesPaths.CREATE}/:id`,
    canActivate: [AuthGuard],
    component: CREATE_CLAIM_WEB
  },
  {
    path:`${ RoutesPaths.CLAIM}/${RoutesPaths.UPDATE}/:id`,
    canActivate: [AuthGuard],
    component: ClaimUpdateComponent
  },
  {
    path:`${ RoutesPaths.CLAIM}/${RoutesPaths.DETAILS}`,
    canActivate: [AuthGuard],
    component: ClaimDetailsComponent
  },
  {
    path: RoutesPaths.HOME,
    canActivate: [AuthGuard],
    component: HomeComponent
  },
  {
    path: RoutesPaths.SUCCESS,
    canActivate: [AuthGuard],
    component: SuccessComponent
  },
  {
    path: RoutesPaths.CALCULAE_SUPPORT,
    canActivate: [AuthGuard],
    component: CalculateSupportComponent
  },
  { path: 'web-api/swagger.json', redirectTo: '/web-api/swagger.json' }, // Ne pas rediriger cette route
  { path: '**', redirectTo: RoutesPaths.LOGIN }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LastStatus, StatusDescriptions } from 'src/app/enums/labelStatus';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { Claim } from 'src/app/types/Claim';
@Component({
  selector: 'app-claim-details',
  templateUrl: './claim-details.component.html',
  styleUrls: ['./claim-details.component.scss'],
})
export class ClaimDetailsComponent implements OnInit {
 
  claim! : Claim;
  statusDescriptions: StatusDescriptions = {
    [LastStatus.CLOSEDACCEPTED]: 'Clos',
    [LastStatus.NOTCONFORM]: 'Non conforme',
    [LastStatus.REFUSED]: 'Refusé',
    [LastStatus.ACCEPTED]: 'Accepté',
    [LastStatus.VALID]: 'Valide',
    [LastStatus.NOTVALID]: 'Non valide',
    [LastStatus.ARBITRATION]: 'Arbitrage',
    [LastStatus.CANCELLED]: 'Annulé',
  };
   constructor( private readonly router: Router) {
  
   }
   ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: { claim : Claim } };
    this.claim =  state.data.claim;

  }
  goBack() {
    this.router.navigate([`${RoutesPaths.CLAIM}/${RoutesPaths.LIST}`]);
  }
}

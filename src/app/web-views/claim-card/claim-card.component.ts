import { Component, Input, OnInit } from '@angular/core';
import { LastStatus, StatusDescriptions } from 'src/app/enums/labelStatus';

@Component({
  selector: 'app-claim-card',
  templateUrl: './claim-card.component.html',
  styleUrls: ['./claim-card.component.scss'],
})
export class ClaimCardComponent   {
  @Input() id : number | undefined ;
  @Input() status : string | undefined ;
  @Input() ecoOrganisme : string | undefined ;
  @Input() type : string | undefined ;
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
  constructor() { }

  

}

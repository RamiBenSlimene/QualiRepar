import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  DatatableComponent,
  ColumnMode,
  SortType
} from '@swimlane/ngx-datatable';
import { filter, forkJoin, Subscription } from 'rxjs';
import { GoogleAnalyticsEffect } from 'src/app/effects/google.analytics.effects';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { LastStatus, StatusDescriptions } from 'src/app/enums/labelStatus';
import { DataStore } from 'src/app/helpers/data.store';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { Claim, ClaimStat, Claims } from 'src/app/types/Claim';
import { ProductTypes } from 'src/app/types/product-type';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-claim-list',
  templateUrl: './claim-list.component.html',
  styleUrls: ['./claim-list.component.scss'],
})
export class ClaimListComponent implements OnInit, OnDestroy {
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  ColumnMode = ColumnMode;
  SortType = SortType;
  loadingIndicator!: boolean;
  temp: Claims = [];
  claims: Claims = [];
  ecologic?: Claims = [];
  ecosystem?: Claims = [];
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
  CLOSEDACCEPTED: ClaimStat = {
    title: 'Dossier clos ',
    count: 0,
    claims: [],
    active: false,
  };
  NOTCONFORM: ClaimStat = {
    title: 'Dossier non conforme',
    count: 0,
    claims: [],
    active: false,
  };
  REFUSED: ClaimStat = {
    title: 'Dossier refusé',
    count: 0,
    claims: [],
    active: false,
  };
  ACCEPTED: ClaimStat = {
    title: 'Dossier accepté ',
    count: 0,
    claims: [],
    active: false,
  };
  VALID: ClaimStat = {
    title: 'Dossier valide',
    count: 0,
    claims: [],
    active: false,
  };
  NOTVALID: ClaimStat = {
    title: 'Dossier non valide ',
    count: 0,
    claims: [],
    active: false,
  };
  ARBITRATION: ClaimStat = {
    title: 'Dossier en arbitrage',
    count: 0,
    claims: [],
    active: false,
  };
  CANCELLED: ClaimStat = {
    title: 'Dossier annulé',
    count: 0,
    claims: [],
    active: false,
  };
  lastStatus = LastStatus;
  orgId!: string;
  productTypeList!: ProductTypes;
  
  displayRead : boolean = true;
  displayWrite : boolean = false;
  read : Claims = [];
  write : Claims = [];
  readCount : number = 0;
  writeCount : number = 0;
  searchText : string = "";
  private routerSubscription!: Subscription;
  constructor(private readonly ecoSupportService: EcoSupportService,
    private readonly router: Router,
    private readonly googleAnalyticsEffect: GoogleAnalyticsEffect, private readonly store: DataStore) { }

    ngOnInit() {
      this.routerSubscription = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.initStats();
          this.initializeComponent();
        });

    }
  
    ngOnDestroy() {
        this.routerSubscription.unsubscribe()
        this.initStats();
    }
  
    private initializeComponent() {
      this.loadingIndicator = true;
      this.googleAnalyticsEffect.onViewClaim();
      this.displayRead  = true;
      this.displayWrite = false;
      this.read  = [];
      this.write = [];
      this.readCount = 0;
      this.writeCount = 0;
      this.searchText = "";
      this.getLists();
    }

  getLists() {
    forkJoin([
      this.ecoSupportService.getWarrantyClaims('44'),
      this.ecoSupportService.getWarrantyClaims('45')
    ]).subscribe(([ecologicData, ecosystemData]) => {
      this.ecologic = ecologicData?.ResponseData;
      this.ecosystem = ecosystemData?.ResponseData;
      this.combineLists();
    });
  }

  combineLists(): void {
    if (this.ecologic && this.ecosystem) {
      this.claims = [...this.ecologic.map(o => ({ ...o, EcoOrganisme: "Ecologic" })),
      ...this.ecosystem.map(o => ({ ...o, EcoOrganisme: "Ecosystem" }))];
      this.sortClaims(this.claims);
      this.temp = this.claims;
      this.populateStats();
      this.initMobile();
    }
  }

  populateStats(): void {
    this.claims.forEach((c: Claim) => {
      if (c.LastStatus == LastStatus.CLOSEDACCEPTED) {
        this.CLOSEDACCEPTED.claims.push(c);
        this.CLOSEDACCEPTED.count++;
      } else if (c.LastStatus == LastStatus.NOTCONFORM) {
        this.NOTCONFORM.claims.push(c);
        this.NOTCONFORM.count++;
      } else if (c.LastStatus == LastStatus.REFUSED) {
        this.REFUSED.claims.push(c);
        this.REFUSED.count++;
      } else if (c.LastStatus == LastStatus.ACCEPTED) {
        this.ACCEPTED.claims.push(c);
        this.ACCEPTED.count++;
      } else if (c.LastStatus == LastStatus.VALID) {
        this.VALID.claims.push(c);
        this.VALID.count++;
      } else if (c.LastStatus == LastStatus.NOTVALID) {
        this.NOTVALID.claims.push(c);
        this.NOTVALID.count++;
      } else if (c.LastStatus == LastStatus.ARBITRATION) {
        this.ARBITRATION.claims.push(c);
        this.ARBITRATION.count++;
      } else if (c.LastStatus == LastStatus.CANCELLED) {
        this.CANCELLED.claims.push(c);
        this.CANCELLED.count++;
      }
    });
  }
  initStats(){
    this.CLOSEDACCEPTED = {
      title: 'Dossier clos ',
      count: 0,
      claims: [],
      active: false,
    };
    this.NOTCONFORM = {
      title: 'Dossier non conforme',
      count: 0,
      claims: [],
      active: false,
    };
    this.REFUSED = {
      title: 'Dossier refusé',
      count: 0,
      claims: [],
      active: false,
    };
    this.ACCEPTED = {
      title: 'Dossier accepté ',
      count: 0,
      claims: [],
      active: false,
    };
    this.VALID = {
      title: 'Dossier valide',
      count: 0,
      claims: [],
      active: false,
    };
    this.NOTVALID = {
      title: 'Dossier non valide ',
      count: 0,
      claims: [],
      active: false,
    };
    this.ARBITRATION = {
      title: 'Dossier en arbitrage',
      count: 0,
      claims: [],
      active: false,
    };
    this.CANCELLED = {
      title: 'Dossier annulé',
      count: 0,
      claims: [],
      active: false,
    };
  }
  updateFilter(event: CustomEvent) {
    const val: string = event.detail.value.toLowerCase();
    const temp = this.temp.filter((d: Claim) => {
      return (
        d.LastStatus?.toLowerCase().startsWith(val) == true ||
        d?.ClaimId?.toString().startsWith(val) == true ||
        d?.BrandLabel?.toLowerCase().startsWith(val) == true ||
        d?.ModelLabel?.toLowerCase().startsWith(val) == true ||
        d?.CreateDate?.toLowerCase().startsWith(val) == true ||
        d?.EcoOrganisme?.toLowerCase().startsWith(val) == true ||
        !val
      );
    });
    this.claims = temp;
    this.table.offset = 0;
  }

  filter(status: LastStatus) {
    if (status == LastStatus.CLOSEDACCEPTED) {
      this.claims = this.CLOSEDACCEPTED.claims;
      this.initStatuts();
      this.CLOSEDACCEPTED.active = true;
    } else if (status == LastStatus.NOTCONFORM) {
      this.claims = this.NOTCONFORM.claims;
      this.initStatuts();
      this.NOTCONFORM.active = true;
    } else if (status == LastStatus.REFUSED) {
      this.claims = this.REFUSED.claims;
      this.initStatuts();
      this.REFUSED.active = true;
    } else if (status == LastStatus.ACCEPTED) {
      this.claims = this.ACCEPTED.claims;
      this.initStatuts();
      this.ACCEPTED.active = true;
    } else if (status == LastStatus.VALID) {
      this.claims = this.VALID.claims;
      this.initStatuts();
      this.VALID.active = true;
    } else if (status == LastStatus.NOTVALID) {
      this.claims = this.NOTVALID.claims;
      this.initStatuts();
      this.NOTVALID.active = true;
    } else if (status == LastStatus.ARBITRATION) {
      this.claims = this.ARBITRATION.claims;
      this.initStatuts();
      this.ARBITRATION.active = true;
    } else if (status == LastStatus.CANCELLED) {
      this.claims = this.CANCELLED.claims;
      this.initStatuts();
      this.CANCELLED.active = true;
    }
    this.searchText = "";
  }
  initStatuts() {
    this.CLOSEDACCEPTED.active = false;
    this.NOTCONFORM.active = false;
    this.NOTCONFORM.active = false;
    this.REFUSED.active = false;
    this.ACCEPTED.active = false;
    this.VALID.active = false;
    this.NOTVALID.active = false;
    this.ARBITRATION.active = false;
    this.CANCELLED.active = false;
    this.sortClaims(this.claims)
  }
  // findByStatus(status: string) {
  //   const temp = this.temp.filter((c: Claim) => {
  //     c?.LastStatus == status;
  //   });
  //   this.claims = temp;
  //   this.table.offset = 0;
  // }
  sortClaims(claims: Claims) {
    claims.sort((a, b) => {
      const dateA = new Date(a.CreateDate || "");
      const dateB = new Date(b.CreateDate || "");
      return dateB.getTime() - dateA.getTime();
    });
  }
  getAll() {
    this.claims = this.temp;
    this.table.offset = 0;
    this.initStatuts();
  }
  redirect(id: string, status: LastStatus, ecoOrganisme: string) {
    if (ecoOrganisme == 'Ecologic') {
      if (status == LastStatus.NOTVALID || status == LastStatus.VALID) {
        this.ecoSupportService.getClaimById(id).subscribe(
          data => {
            this.orgId = data?.ResponseData?.WarrantyClaim?.ManufacturerDto?.ManufacturerId
            this.ecoSupportService.getValidators(this.orgId, 'ISG', 250).subscribe((response: any) => {
              this.store.setValidatores(response.ResponseData)
              this.store.setProductId(data?.ResponseData?.WarrantyClaim?.ClaimExtend?.ProductCode)
              this.router.navigate([`/${RoutesPaths.CLAIM}/${RoutesPaths.UPDATE}`, id]);
            });
          })
      } else {
        const url: string = `${environment.ecologic_url}${id}`;
        window.open(url, '_blank');
      }
    } else {
      if (status == LastStatus.NOTVALID || status == LastStatus.VALID || status == LastStatus.NOTCONFORM) {

        this.ecoSupportService.getClaimById(id).subscribe(
          data => {
            this.orgId = data?.ResponseData?.WarrantyClaim?.ManufacturerDto?.ManufacturerId
            this.ecoSupportService.getValidators(this.orgId, 'ISG', 250).subscribe((response: any) => {
              this.store.setValidatores(response.ResponseData || [])
              this.store.setProductId(data?.ResponseData?.WarrantyClaim?.ClaimExtend?.ProductCode)
              this.router.navigate([`/${RoutesPaths.CLAIM}/${RoutesPaths.UPDATE}`, id]);
            });
          })
      } else {
        window.open(environment.ecosystem_url, '_blank');
      }
    }
  }

  toggleRead(){
    this.displayRead = !this.displayRead;
  }
  toggleWrite(){
    this.displayWrite = !this.displayWrite;
  }
  updateFilterMobile(event: any) {
    this.initMobile();
    const val: string = event.detail.value.toLowerCase();
    const readtemp = this.read.filter((d: Claim) => {
      return (
        d.LastStatus?.toLowerCase().startsWith(val) == true ||
        d?.ClaimId?.toString().startsWith(val) == true ||
        d?.ModelLabel?.toLowerCase().startsWith(val) == true ||
        d?.EcoOrganisme?.toLowerCase().startsWith(val) == true ||
        !val
      );
    });
    const writetemp = this.write.filter((d: Claim) => {
      return (
        d.LastStatus?.toLowerCase().startsWith(val) == true ||
        d?.ClaimId?.toString().startsWith(val) == true ||
        d?.ModelLabel?.toLowerCase().startsWith(val) == true ||
        d?.EcoOrganisme?.toLowerCase().startsWith(val) == true ||
        !val
      );
    });

  this.read = readtemp;
  this.readCount = this.read.length;
  this.write = writetemp;
  this.writeCount = this.write.length; 
 }
  initMobile(){
    this.read = this.claims.filter((item) =>
      item.LastStatus === LastStatus.ACCEPTED ||
      item.LastStatus === LastStatus.ARBITRATION ||
      item.LastStatus === LastStatus.CANCELLED ||
      item.LastStatus === LastStatus.CLOSEDACCEPTED ||
      item.LastStatus === LastStatus.REFUSED 
    ); 
    this.readCount = this.read.length;
    this.write = this.claims.filter((item) =>
      item.LastStatus === LastStatus.NOTVALID ||
      item.LastStatus === LastStatus.NOTCONFORM ||
      item.LastStatus === LastStatus.VALID 
    ); 
    this.writeCount = this.write.length;
  }
  openDetails(claim : Claim){
    this.router.navigateByUrl(`/${RoutesPaths.CLAIM}/${RoutesPaths.DETAILS}`, { state: { data: { claim : claim } } });
  }
  openUpdate(id? : number){
    if(id){
      this.ecoSupportService.getClaimById(id.toString()).subscribe(
        data => {
          this.orgId = data?.ResponseData?.WarrantyClaim?.ManufacturerDto?.ManufacturerId
          this.ecoSupportService.getValidators(this.orgId, 'ISG', 250).subscribe((response: any) => {
            this.store.setValidatores(response.ResponseData)
            this.store.setProductId(data?.ResponseData?.WarrantyClaim?.ClaimExtend?.ProductCode)
            this.router.navigate([`/${RoutesPaths.CLAIM}/${RoutesPaths.UPDATE}`, id]);
          });
        }); 
    }
  }
}

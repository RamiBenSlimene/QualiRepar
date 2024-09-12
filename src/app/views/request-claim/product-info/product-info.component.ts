import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { retry, tap } from 'rxjs';
import { ClaimEffects } from 'src/app/effects/claim.effects';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { DataStore } from 'src/app/helpers/data.store';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { ApiResponse } from 'src/app/types/api-response';
import { Attachement, AttachementType } from 'src/app/types/attachement';
import { AttachedFile } from 'src/app/types/claim-request';
import { SubList } from 'src/app/types/product-type';
import { SelectList } from 'src/app/types/select.list';
import { DepotSites, RepairSites } from 'src/app/types/site';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.scss'],
})
export class ProductInfoComponent implements OnInit {
  @Input() infoProductForm!: FormGroup;
  repairSiteList: SelectList = [];
  depotSiteList: SelectList = [];
  codeIrisList: SubList[] = [];
  attachementType = AttachementType;
  attachement: Attachement | null = null;
  isUploaded: boolean = false;
  isUpdate: boolean = false;
  Validators = Validators;

  constructor(
    private readonly claimEffects: ClaimEffects,
    private readonly ecoSupportService: EcoSupportService,
    private dataStore: DataStore,
    private readonly router: Router) {
    // this.getRepairSitesList();
    this.getDepotSitesList();
  }

  ngOnInit(): void {
    const attachement: AttachedFile = this.infoProductForm.value.Attachement;
    if (this.router.url.startsWith(`/${RoutesPaths.CLAIM}/${RoutesPaths.UPDATE}`)) {
      this.getRepairSitesList(true);
      this.isUpdate = true;
      if (attachement.Size) {
        this.isUploaded = true;
        this.attachement = {
          name: attachement.FileName,
          size: this.convertirEnKiloOctets(attachement.Size),
          body: attachement.ContentThumbnail,
          lastUpdate: new Date(),
          type: AttachementType.plaque
        }
        this.attachement.name = attachement.FileName;
      }
      this.getCodeIRISList(this.infoProductForm?.value.productId);
    } else {
      this.getRepairSitesList(false);
      this.getCodeIRISList(this.dataStore.getProductId());
    }
  }



  getRepairSitesList(isUpdate: boolean) {
    this.ecoSupportService.getRepairSitesList().pipe(
      retry(3),
      tap((response: ApiResponse<RepairSites> | null) => {
        if (response) {
          this.repairSiteList = response.ResponseData.map((item) => ({
            value: item.SiteId,
            text: item.City ? `${item.Name} - ${item.City}` : item.Name
          }));
        }
        if (this.repairSiteList.length > 0 && !isUpdate) {
          this.infoProductForm.patchValue({
            repairSiteId: this.repairSiteList[0].value
          });
        }
      })
    )
      .subscribe();
  }

  getDepotSitesList() {
    this.ecoSupportService.getDepotSitesList().pipe(
      retry(3),
      tap((response: ApiResponse<DepotSites> | null) => {
        if (response) {
          this.depotSiteList = response.ResponseData.map((item) => ({
            value: item.SiteId,
            text: item.City ? `${item.Name} - ${item.City}` : item.Name
          }));
        }
      })
    )
      .subscribe();
  }

  getCodeIRISList(productId: string) {
    this.claimEffects.getCodesIrisList(productId).subscribe(
      (data) => {
        data.map(code => code.Label = `${code.Code} - ${code.Label}`)
        this.codeIrisList = data;
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  async upload(event: { attachement: Attachement, loading: HTMLIonLoadingElement }) {
    this.attachement = event.attachement;
    if (event.attachement.name && event.attachement.type) {
      this.claimEffects.uplodeAttachementWithoutLoader(event.attachement)
        .subscribe(
          (data) => {
            event.loading.dismiss();
            this.isUploaded = true;

          },
          err => {
            event.loading.dismiss();
          }
        );
    }
  }

  convertirEnKiloOctets(octets?: string | number): string {
    if (octets) {
      const kiloOctets = Math.round(+octets / 1024);
      return kiloOctets.toString() + " KO";
    } else {
      return "";
    }
  }
}

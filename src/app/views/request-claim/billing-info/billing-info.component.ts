import { registerLocaleData } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { DataStore } from 'src/app/helpers/data.store';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { ClaimRequest } from 'src/app/types/claim-request';
import localeFr from '@angular/common/locales/fr';
import { IonModal } from '@ionic/angular/common';
import { ClaimEffects } from 'src/app/effects/claim.effects';
import { Router } from '@angular/router';
import { RoutesPaths } from 'src/app/enums/RoutesPath';

registerLocaleData(localeFr);

@Component({
  selector: 'app-billing-info',
  templateUrl: './billing-info.component.html',
  styleUrls: ['./billing-info.component.scss']
})
export class BillingInfoComponent implements OnInit {
  @Input() facturationForm!: FormGroup;
  @ViewChild('DatetimePopup')
  DatetimePopup!: IonModal;
  showDateTimeButton: boolean = false;
  supportAmount!: string;
  selectedFiles: { fileContent: string, title: string }[] = [];
  Validators = Validators;

  constructor(
    private readonly ecoSupportService: EcoSupportService,
    private readonly store: DataStore,
    private readonly claimEffects: ClaimEffects,
    private router: Router) {

  }
  ngOnInit(): void {
    if (this.router.url.includes(`/${RoutesPaths.CLAIM}/${RoutesPaths.CREATE}`)) {
      this.supportAmount = this.store.getSupportAmount();
    } else {
      this.supportAmount = this.facturationForm?.value?.supportAmmount;  // ClaimExtend // SupportGrant
    }
  }

  getAccordionHeaderColor(formGroup: FormGroup): string {
    if (this.ecoSupportService.submitted && formGroup.invalid) {
      return 'danger';
    } else {
      return 'light';
    }
  }
  closeDatetimePicker() {
    this.DatetimePopup.dismiss();
  }

  upload(request: ClaimRequest) {
  }

  attachFile(eventData: { fileContent: string, title: string }) {
    this.claimEffects.uplodeAttachement(eventData);
  }

}

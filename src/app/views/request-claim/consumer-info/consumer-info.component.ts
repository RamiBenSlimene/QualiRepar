import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ClaimEffects } from 'src/app/effects/claim.effects';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { DataStore } from 'src/app/helpers/data.store';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { Attachement, AttachementType } from 'src/app/types/attachement';
import { AttachedFile } from 'src/app/types/claim-request';


@Component({
  selector: 'app-consumer-info',
  templateUrl: './consumer-info.component.html',
  styleUrls: ['./consumer-info.component.scss'],
})
export class ConsumerInfoComponent implements OnInit {
  @Input() userForm!: FormGroup;
  attachement: Attachement | null = null;
  organisationId: string
  isUploaded: boolean = false;
  isUpdate: boolean = false;
  attachementType = AttachementType;
  filtredZipCodes: any[] = [];
  filtredCities: any[] = [];
  focusedCity = false;
  focusedZip = false;
  typeaheadCity = new Subject<string>();
  typeaheadZip = new Subject<string>();
  loadingCity = false;
  loadingZip = false;
  typingZip = false;
  selectedCity = false;
  selectedZip = false;
  typingCity = false;
  isZipSelected: boolean = false;
  Validators = Validators;
  @ViewChild('selectZip') selectZip!: ElementRef;
  @ViewChild('selectCity') selectCity!: ElementRef;

  constructor(
    private readonly ecoSupportService: EcoSupportService,
    private readonly store: DataStore,
    private readonly claimEffects: ClaimEffects,
    private readonly router: Router
  ) {
    this.organisationId = this.store.getOrganizationId();
    this.typeaheadZip.pipe(
      debounceTime(300),       // Wait for 300ms pause in events
      distinctUntilChanged(),  // Ignore if next search term is same as previous
      switchMap(term => {
        this.loadingZip = true;
        return this.ecoSupportService.getCityFromHexaPoste('250', term);
      })
    ).subscribe(items => {
      this.filtredZipCodes = Array.from(new Set(items.map((item: { zipCode: any; }) => item.zipCode)));

      this.loadingZip = false;
    }, (error) => {
      console.error('Error fetching hexaPostes:', error);
      this.loadingZip = false;
    });

  }
  ngOnInit(): void {
    const attachement: AttachedFile = this.userForm.value.Attachement;
    if (this.router.url.startsWith(`/${RoutesPaths.CLAIM}/${RoutesPaths.UPDATE}`)) {
      this.isUpdate = true;
      if (attachement.Size) {
        this.isUploaded = true;
        this.attachement = {
          name: attachement.FileName,
          size: this.convertirEnKiloOctets(attachement.Size),
          body: attachement.ContentThumbnail,
          lastUpdate: new Date(),
          type: AttachementType.validation
        }
      }

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

  async upload(event: { attachement: Attachement, loading: HTMLIonLoadingElement }) {
    this.attachement = event.attachement;
    if (event.attachement.name && event.attachement.type) {
      this.claimEffects.uplodeAttachementWithoutLoader(event.attachement)
        .subscribe(
          (data) => {
            this.isUploaded = true;
            event.loading.dismiss();
          },
          err => {
            event.loading.dismiss();
          }
        );
    }
  }

  getAccordionHeaderColor(formGroup: FormGroup): string {
    return this.ecoSupportService.submitted && formGroup.invalid ? 'danger' : 'light';
  }

  onBlurZip(event: any) {
    const inputText = event.target.value;
    const selectedItem = this.filtredZipCodes.find(item => item.zipCode === inputText);
    if (!selectedItem) {
      // Clear the ng-select value
      event.target.value = null;

    }
  }

  onBlurCity(event: any) {
    const inputText = event.target.value;
    const selectedItem = this.filtredCities.find(item => item.city === inputText);
    if (!selectedItem) {
      // Clear the ng-select value
      event.target.value = null;

    }
  }


  onZipCodeChange(event: any) {
    const zipCode = event;

    if (this.userForm.value.Zip != null && zipCode != null) {
      this.isZipSelected = true;
      this.fetchCities(zipCode);
    }
  }

  fetchCities(zipCode: string) {
    const countryCode = '250'; // Replace with actual country code
    this.loadingCity = true;
    this.ecoSupportService.getCityFromHexaPoste(countryCode, this.userForm.value.Zip).subscribe(items => {
      this.filtredCities = Array.from(new Set(items.map((item: { city: any; }) => item.city))).sort();
      this.loadingCity = false;
    }, error => {
      console.error('Error fetching cities', error);
      this.loadingCity = false;
    });
  }
}

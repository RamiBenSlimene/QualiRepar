import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IonContent, LoadingController, ToastController } from '@ionic/angular';
import { ClaimEffects } from 'src/app/effects/claim.effects';
import { GoogleAnalyticsEffect } from 'src/app/effects/google.analytics.effects';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { StatusDescriptions, LastStatus } from 'src/app/enums/labelStatus';
import { DataStore } from 'src/app/helpers/data.store';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { AttachedFile, ClaimRequest } from 'src/app/types/claim-request';
import { ErrorDetail, ValidationErrors } from 'src/app/types/validationErrors';
@Component({
  selector: 'app-claim-update',
  templateUrl: './claim-update.component.html',
  styleUrls: ['./claim-update.component.scss'],
})
export class ClaimUpdateComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  infoProductForm!: FormGroup;
  facturationForm!: FormGroup;
  errors: ValidationErrors = [];
  claim!: ClaimRequest;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  claimId!: string;
  statut!: string;
  loading: boolean = true;
  requiredFields: string[] = [];
  product!: string;
  brand!: string;
  constructor(
    private readonly router: Router,
    private fb: FormBuilder,
    private readonly ecoSupportService: EcoSupportService,
    private readonly store: DataStore,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private readonly claimEffect: ClaimEffects,
    private readonly toastController: ToastController,
    private readonly googleAnalyticsEffect: GoogleAnalyticsEffect
  ) {
    this.requiredFields = this.store.getValidatores();

    this.route.params.subscribe((params: Params) => {
      this.claimId = params['id'];
      this.store.setClaimId(this.claimId);
      this.getstatut(this.claimId);
      this.ecoSupportService.getClaimById(this.claimId).subscribe((data) => {
        this.claim = this.claimEffect.mapClaim(
          data?.ResponseData?.WarrantyClaim
        );
        this.initForms(this.claim);
        this.product = data?.ResponseData?.WarrantyClaim?.ModelLabel;
        this.brand = data?.ResponseData?.WarrantyClaim?.BrandLabel;
        this.errors = data?.ResponseData?.WarrantyClaim?.ValidationErrors;
        this.userForm.markAllAsTouched();
        this.infoProductForm.markAllAsTouched();
        this.facturationForm.markAllAsTouched();
        this.loading = false;
      });
    });
  }

  isFieldRequired(fieldName: string): boolean {
    return this.requiredFields.some((requiredField) =>
      fieldName.includes(requiredField)
    );
  }

  transformValidationResults(data: {
    [key: string]: ErrorDetail;
  }): ErrorDetail[] {
    if (data) {
      return Object.keys(data).map((key) => ({
        ...data[key],
        Code: key.replace(/([A-Z])/g, ' $1').trim(), // This transforms CamelCase to spaced words
      }));
    } else return [];
  }
  ngOnInit() {
    this.ecoSupportService.submitted = false;
    this.googleAnalyticsEffect.onUpdateClaim();
  }
  ngOnDestroy(): void {
    this.store.deleteClaimtId();
  }
  initForms(claim: ClaimRequest) {
    this.userForm = this.createUserFormGroup(claim);
    this.infoProductForm = this.createInfoFormGroup(claim);
    this.facturationForm = this.createFactureFormGroup(claim);
  }
  private createInfoFormGroup(claim?: any): FormGroup {
    var attachement: AttachedFile = {};
    if (claim?.AttachedFiles) {
      claim?.AttachedFiles.forEach((att: AttachedFile) => {
        if (att.FileTypeCode == 'NAMEPLATE') {
          attachement = att;
        }
      });
    }
    return this.fb.group({
      productId: [claim?.Product?.ProductId, Validators.required],
      brandId: [claim?.Product?.BrandId, Validators.required],
      repairSiteId: [claim?.RepairSite?.id || null, Validators.required],
      depositSiteId: [
        claim?.DepositSite?.id || null,
        this.isFieldRequired('DepositSiteId') ? Validators.required : null,
      ],
      commercialRef: [
        claim?.Product?.CommercialRef || claim?.Product?.commercialRef || '',
        this.isFieldRequired('ModelCommercialRef') ? Validators.required : null,
      ],
      serialNumber: [
        claim?.Product?.SerialNumber || claim?.Product?.serialNumber || '',
        this.isFieldRequired('ModelSerial') ? Validators.required : null,
      ],
      IRISFamily: [claim?.Product?.IRISFamily, Validators.required],
      IRISSection: [claim?.Product?.IRISSection || null],
      IRISCondition: [claim?.Product?.IRISCondition || null],
      IRISSymptom: [claim?.Product?.IRISSymptom || null],
      IRISDefault: [claim?.Product?.IRISDefault || null],
      IRISRepair: [claim?.Product?.IRISRepair || null],
      FailureDescription: [
        claim?.Product?.FailureDescription || 'XXXXXXXXXXXXXXX',
      ],
      // IRISSection: [claim?.Product?.IRISFamily || ''],
      // IRISCondition: [claim?.Product?.IRISFamily || ''],
      // IRISSymptom: [claim?.Product?.IRISFamily || ''],
      // IRISDefault: [claim?.Product?.IRISFamily || ''],
      // IRISRepair: [claim?.Product?.IRISFamily || ''],
      Attachement: [attachement || ''],
    });
  }

  private createUserFormGroup(claim?: any): FormGroup {
    var attachement: AttachedFile = {};
    if (claim?.AttachedFiles) {
      claim?.AttachedFiles.forEach((att: AttachedFile) => {
        if (att.FileTypeCode == 'OTHER') {
          attachement = att;
        }
      });
    }
    return this.fb.group({
      LastName: [
        claim?.Consumer?.LastName || '',
        this.isFieldRequired('ConsumerDto.LastName')
          ? Validators.required
          : null,
      ],
      FirstName: [
        claim?.Consumer?.FirstName || '',
        this.isFieldRequired('ConsumerDto.FirstName')
          ? Validators.required
          : null,
      ],
      Phone: [
        claim?.Consumer?.Phone || '',
        this.isFieldRequired('ConsumerDto.MobilePhone')
          ? Validators.required
          : null,
      ],
      Zip: [
        claim?.Consumer?.Zip || null,
        [
          Validators.pattern('[0-9]{5}'),
          this.isFieldRequired('ConsumerDto.Zip') ? Validators.required : null,
        ],
      ],
      City: [
        claim?.Consumer?.City || null,
        this.isFieldRequired('ConsumerDto.City') ? Validators.required : null,
      ],
      Email: [
        claim?.Consumer?.Email || '',
        [
          this.isFieldRequired('ConsumerDto.Email')
            ? Validators.required
            : null,
          Validators.email,
        ].filter(Boolean),
      ],
      Title: [claim?.Consumer?.Title || 1],
      StreetNumber: [claim?.Consumer?.StreetNumber || ''],
      Address1: [
        claim?.Consumer?.Address1 || '',
        this.isFieldRequired('ConsumerDto.Address1')
          ? Validators.required
          : null,
      ],
      Address2: [claim?.Consumer?.Address2 || ''],
      Address3: [claim?.Consumer?.Address3 || ''],
      Country: [claim?.Consumer?.Country || 250],
      Civility: [1],
      Attachement: [attachement || ''],
    });
  }

  private createFactureFormGroup(claim?: ClaimRequest): FormGroup {
    return this.fb.group({
      supportAmmount: [claim?.Quote?.SupportAmount?.Amount],
      NumFolder: [
        claim?.Quote?.NumFolder || '',
        this.isFieldRequired('ClaimCodeClient') ? Validators.required : null,
      ],
      TotalAmountInclVAT: [
        claim?.Quote?.TotalAmountInclVAT?.Amount || '',
        this.isFieldRequired('ClaimExtend.TotalRepairCostVATIn')
          ? Validators.required
          : null,
      ],
      ConsumerInvoiceNumber: [
        claim?.Quote?.ConsumerInvoiceNumber || '',
        Validators.required,
      ],
      RepairDate: [
        claim?.Quote?.RepairDate?.split('T')[0] || '',
        this.isFieldRequired('InterventionEndDate')
          ? Validators.required
          : null,
      ],
    });
  }

  upload(request: ClaimRequest) {
    if (request.Product && this.claim.Product) {
      request.Product.BrandId = this.claim.Product.BrandId;
      request.Product.ProductId = this.claim.Product.ProductId;
    }
    this.store.setClaimId(this.claimId);
    this.store.setAiInvoice(request);
    this.initForms(request);
    this.facturationForm.addControl(
      'completionViaFacture',
      new FormControl('true')
    );
    this.userForm.markAllAsTouched();
    this.infoProductForm.markAllAsTouched();
    this.facturationForm.markAllAsTouched();
  }

  goBack() {
    this.router.navigate([RoutesPaths.CALCULAE_SUPPORT]);
  }

  async saveClaim() {
    this.errors = [];
    const loading = await this.loadingCtrl.create({ message: 'Chargement..' });
    await loading.present();
    const endDateRepair = this.facturationForm.value.RepairDate;
    const consumerInvoiceNumber =
      this.facturationForm.value.ConsumerInvoiceNumber;
    const numFolder = this.facturationForm.value.NumFolder;
    const repairSiteId = this.infoProductForm.value.repairSiteId;
    const requestData: ClaimRequest = {
      Consumer: this.userForm.value,
      Product: this.infoProductForm.value,
      RepairSite: {},
      DepositSite: {},
      Quote: {
        ConsumerInvoiceNumber: consumerInvoiceNumber,
        RepairDate: endDateRepair,
        NumFolder: numFolder,
        TotalAmountExclVAT: {},
        LaborCost: {},
        SparePartsCost: {},
        TravelCost: {},
        TotalAmountInclVAT: {
          Amount: this.facturationForm.value.TotalAmountInclVAT || 0,
          Currency: 'EUR',
        },
        SupportAmount: {
          Amount: Number(this.store.getSupportAmount()),
          Currency: 'EUR',
        },
      },
    };
    const claimId = Number(this.claimId);

    if (!consumerInvoiceNumber) {
      this.addError('Numéro de facture', 'Cette valeur est obligatoire');
      this.facturationForm.get('ConsumerInvoiceNumber')?.setErrors({});
      this.content.scrollToTop(1500);
      loading.dismiss();

      this.show('Impossible de sauvegarder les modifications.', 'danger');
    } else {
      this.ecoSupportService.updateClaim(
        claimId,
        requestData,
        endDateRepair,
        repairSiteId,
        consumerInvoiceNumber,
        this.facturationForm.value.NumFolder,
        false,
        loading
      );
      this.ecoSupportService.SaveUpdateClaimResponse$.subscribe(
        (data) => {
          if (data?.ResponseData?.ValidationErrors?.length > 0) {
            this.show(
              'Les modifications ont bien été enregistrées.',
              'success'
            );

            this.errors = data.ResponseData.ValidationErrors;
            this.hundelErrors(this.errors);
            this.store.setErrors(this.errors);
            this.content.scrollToTop(1500);
            this.getstatut(this.claimId);
          } else {
            this.show(
              'Les modifications ont bien été enregistrées.',
              'success'
            );
            this.content.scrollToTop(1500);
          }
          loading.dismiss();
        },
        (err) => {
          loading.dismiss();
          this.show('Impossible de sauvegarder les modifications.', 'danger');

          // this.show("Des erreurs de validation ont été détectées.", "danger");
        }
      );
    }
  }

  async sendClaim() {
    const loading = await this.loadingCtrl.create({ message: 'Chargement..' });
    await loading.present();
    const endDateRepair = this.facturationForm.value.RepairDate;
    const consumerInvoiceNumber =
      this.facturationForm.value.ConsumerInvoiceNumber;
    const numFolder = this.facturationForm.value.NumFolder;
    const repairSiteId = this.infoProductForm.value.repairSiteId;
    const requestData: ClaimRequest = {
      Consumer: this.userForm.value,
      Product: this.infoProductForm.value,
      RepairSite: {},
      DepositSite: {},
      Quote: {
        ConsumerInvoiceNumber: consumerInvoiceNumber,
        RepairDate: endDateRepair,
        NumFolder: numFolder,
        TotalAmountExclVAT: {},
        LaborCost: {},
        SparePartsCost: {},
        TravelCost: {},
        TotalAmountInclVAT: {
          Amount: this.facturationForm.value.TotalAmountInclVAT || 0,
          Currency: 'EUR',
        },
        SupportAmount: {
          Amount: Number(this.store.getSupportAmount()),
          Currency: 'EUR',
        },
      },
    };
    const claimId = Number(this.claimId);
    this.ecoSupportService.updateClaim(
      claimId,
      requestData,
      endDateRepair,
      repairSiteId,
      consumerInvoiceNumber,
      this.facturationForm.value.NumFolder,
      true,
      loading
    );
    this.ecoSupportService.SendUpdateClaimResponse$.subscribe(
      (data) => {
        if (data?.ResponseData?.ValidationErrors?.length > 0) {
          loading.dismiss();
          this.errors = data.ResponseData.ValidationErrors;
          this.hundelErrors(this.errors);
          this.store.setErrors(this.errors);
          this.content.scrollToTop(1500);
          this.getstatut(this.claimId);
        } else {
          loading.dismiss();
          this.router.navigate([RoutesPaths.SUCCESS]);
        }
      },
      (err) => {
        loading.dismiss();
      }
    );
  }

  hundelErrors(errors: any) {
    errors.forEach((error: any) => {
      switch (error.Field) {
        case 'Numéro de série':
          this.infoProductForm.get('serialNumber')?.setErrors({});
          break;
        case 'Numéro de facture':
          this.facturationForm
            .get('ConsumerInvoiceNumber')
            ?.setErrors({ customError: error.ErrorMessage });
          break;
        case 'Date de réparation':
          this.facturationForm
            .get('RepairDate')
            ?.setErrors({ required: true, customError: error.ErrorMessage });
          break;
      }
    });
    this.userForm.markAllAsTouched();
    this.infoProductForm.markAllAsTouched();
    this.facturationForm.markAllAsTouched();
  }

  addError(Field: string, message: string) {
    this.errors = [...this.errors, { Field: Field, ErrorMessage: message }];
  }

  async show(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top',
      color: color,
    });
    await toast.present();
  }

  statusDescriptions: StatusDescriptions = {
    [LastStatus.CLOSEDACCEPTED]: 'Clos',
    [LastStatus.NOTCONFORM]: 'Non conforme',
    [LastStatus.REFUSED]: 'Refusé',
    [LastStatus.ACCEPTED]: 'Accepté',
    [LastStatus.VALID]: 'Valide',
    [LastStatus.NOTVALID]: 'Non valide',
    [LastStatus.ARBITRATION]: 'Arbitrage',
    [LastStatus.CANCELLED]: 'Annulé',
    [LastStatus.WAITING]: 'En cours',
  };

  getstatut(claimId: string){
    this.ecoSupportService.getClaimStatus(claimId).subscribe((data) => {
      if (data?.ResponseData.LastStatus) {
        this.statut = data?.ResponseData.LastStatus;
      } else {
        this.statut = 'Erreur';
      }
    });
  }
  async download(){
    this.loading = true;
      this.ecoSupportService.getClaimById(this.claimId).subscribe((data) => {
        this.claim = this.claimEffect.mapClaim(data?.ResponseData?.WarrantyClaim);
        const files = this.claim?.AttachedFiles;
        console.log(files)
        if(files){
         const invoiceFile = files.find(f => f.FileTypeCode === 'INVOICE');
         if(invoiceFile?.ContentThumbnail){
          const fileType = this.claimEffect.detectFileType(invoiceFile.ContentThumbnail);
          this.claimEffect.downloadInvoice(invoiceFile.ContentThumbnail, fileType);
         }else {
          this.show("Facture introuvable","danger")
        }
        }else {
          this.show("Facture introuvable","danger")
        }
         this.loading = false;
    }, err => {       this.loading = false;
      this.show("Facture introuvable","danger")});
  }
}

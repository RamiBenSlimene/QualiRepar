import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IonModal, IonContent, LoadingController, ToastController } from '@ionic/angular';
import { ClaimEffects } from 'src/app/effects/claim.effects';
import { GoogleAnalyticsEffect } from 'src/app/effects/google.analytics.effects';
import { RoutesPaths } from 'src/app/enums/RoutesPath';
import { DataStore } from 'src/app/helpers/data.store';
import { DataImageService } from 'src/app/services/data.image.service';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { ClaimRequest } from 'src/app/types/claim-request';
import { ValidationErrors } from 'src/app/types/validationErrors';
@Component({
  selector: 'app-create-claim',
  templateUrl: './create-claim.component.html',
  styleUrls: ['./create-claim.component.scss'],
})
export class CreateClaimComponent implements OnInit {
  userForm!: FormGroup;
  infoProductForm!: FormGroup;
  facturationForm!: FormGroup;
  errors: ValidationErrors = [];
  request!: ClaimRequest;
  @ViewChild('modalPick', { static: true }) modalPick!: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  isAlertOpen = false;
  alertButtons = ['Fermer'];
  product: string;
  brand: string;
  claimId!: string;
  requiredFields: string[];
  statut!: string;
  claim!: ClaimRequest;
  loading: boolean = false;

  isFieldRequired(fieldName: string): boolean {
    return this.requiredFields.some(requiredField => fieldName.includes(requiredField));
  }

  constructor(
    private readonly router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private readonly ecoSupportService: EcoSupportService,
    private readonly store: DataStore,
    public photoService: DataImageService,
    private loadingCtrl: LoadingController,
    private readonly toastController: ToastController,
    private readonly googleAnalyticsEffect: GoogleAnalyticsEffect,
    private readonly claimEffect: ClaimEffects,

  ) {
    this.request = this.store.getAiInvoice();
    this.product = this.store.getProductName();
    this.brand = this.store.getBrandName();
    this.requiredFields = this.store.getValidatores()
    this.route.params.subscribe((params: Params) => {
      this.claimId = params['id'];
      this.getstatut(this.claimId);
    })
  }

  ngOnInit() {
    this.ecoSupportService.submitted = false;
    this.initForms(this.request);
    this.userForm.markAllAsTouched();
    this.infoProductForm.markAllAsTouched();
    this.facturationForm.markAllAsTouched();
    this.googleAnalyticsEffect.onCreateClaim();
  }

  initForms(claim: ClaimRequest) {
    this.userForm = this.createUserFormGroup(claim);
    this.infoProductForm = this.createInfoFormGroup(claim);
    this.facturationForm = this.createFactureFormGroup(claim);
  }

  createInfoFormGroup(claim?: any): FormGroup {
    return this.fb.group({
      productId: [this.store.getProductId(), Validators.required],
      brandId: [this.store.getBrandId(), Validators.required],
      repairSiteId: [claim?.Product?.repairSiteId || null, Validators.required],
      depositSiteId: [claim?.Product?.depositSiteId || null, this.isFieldRequired('DepositSiteId') ? Validators.required : null],
      commercialRef: [claim?.Product?.CommercialRef || claim?.Product?.commercialRef || '', this.isFieldRequired('ModelCommercialRef') ? Validators.required : null],
      serialNumber: [claim?.Product?.SerialNumber || claim?.Product?.serialNumber || '', this.isFieldRequired('ModelSerial') ? Validators.required : null],
      IRISFamily: [claim?.Product?.IRISFamily, Validators.required],
      // IRISSection: [claim?.Product?.IRISFamily || ''],
      // IRISCondition: [claim?.Product?.IRISFamily || ''],
      // IRISSymptom: [claim?.Product?.IRISFamily || ''],
      // IRISDefault: [claim?.Product?.IRISFamily || ''],
      // IRISRepair: [claim?.Product?.IRISFamily || ''],
      FailureDescription: ['XXXXXXXXXXXXXXX'],
    });
  }

  createUserFormGroup(claim?: any): FormGroup {
    return this.fb.group({
      LastName: [claim?.Consumer?.LastName || '', this.isFieldRequired('ConsumerDto.LastName') ? Validators.required : null],
      FirstName: [claim?.Consumer?.FirstName || '', this.isFieldRequired('ConsumerDto.FirstName') ? Validators.required : null],
      Phone: [claim?.Consumer?.Phone || '', this.isFieldRequired('ConsumerDto.MobilePhone') ? Validators.required : null],
      Zip: [claim?.Consumer?.Zip || null, [Validators.pattern('[0-9]{5}'), this.isFieldRequired('ConsumerDto.Zip') ? Validators.required : null]],
      City: [claim?.Consumer?.City || null, this.isFieldRequired('ConsumerDto.City') ? Validators.required : null],
      Email: [claim?.Consumer?.Email || '', [this.isFieldRequired('ConsumerDto.Email') ? Validators.required : null, Validators.email].filter(Boolean)],
      Title: [claim?.Consumer?.Title || 1],
      StreetNumber: [claim?.Consumer?.streetNumber || ''],
      Address1: [claim?.Consumer?.Address1 || '', this.isFieldRequired('ConsumerDto.Address1') ? Validators.required : null],
      Address2: [claim?.Consumer?.Address2 || ''],
      Address3: [claim?.Consumer?.Address3 || ''],
      Country: [claim?.Consumer?.Country || 250],
      Civility: [1]
    });
  }

  createFactureFormGroup(claim?: ClaimRequest): FormGroup {
    return this.fb.group({
      NumFolder: [claim?.Quote?.NumFolder || '', this.isFieldRequired('ClaimCodeClient') ? Validators.required : null],
      TotalAmountInclVAT: [claim?.Quote?.TotalAmountInclVAT?.Amount || '', this.isFieldRequired('ClaimExtend.TotalRepairCostVATIn') ? Validators.required : null],
      ConsumerInvoiceNumber: [claim?.Quote?.ConsumerInvoiceNumber || '', Validators.required],
      RepairDate: [claim?.Quote?.RepairDate?.split('T')[0] || '', this.isFieldRequired('InterventionEndDate') ? Validators.required : null]
    });
  }

  upload(request: ClaimRequest) {
    this.store.setAiInvoice(request);
    this.request = request;
    this.initForms(this.request);
    this.facturationForm.addControl('completionViaFacture', new FormControl('true'));
    this.userForm.markAllAsTouched();
    this.infoProductForm.markAllAsTouched();
    this.facturationForm.markAllAsTouched();
    this.googleAnalyticsEffect.onUploadChatGPT();
  }

  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }

  goBack() {
    this.router.navigate([RoutesPaths.CALCULAE_SUPPORT]);
  }

  async saveClaim() {
    this.googleAnalyticsEffect.onClaimSave();
    this.errors = [];
    const loading = await this.loadingCtrl.create({ message: 'Chargement..' });
    await loading.present();
    const endDateRepair = this.facturationForm.value.RepairDate;
    const consumerInvoiceNumber = this.facturationForm.value.ConsumerInvoiceNumber;
    const numFolder = this.facturationForm.value.NumFolder;
    const repairSiteId = this.infoProductForm.value.repairSiteId;
    const requestData: ClaimRequest = {
      Consumer: this.userForm.value,
      Product: this.infoProductForm.value,
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
        }
      }
    };

    if (!consumerInvoiceNumber) {
      this.addError("Numéro de facture", "Cette valeur est obligatoire");
      this.facturationForm.get('ConsumerInvoiceNumber')?.setErrors({});
      this.content.scrollToTop(1500);
      loading.dismiss();
      this.show("Impossible de sauvegarder les modifications.", "danger");
    } else {
      this.ecoSupportService.updateClaim(
        Number(this.claimId), requestData, endDateRepair,
        repairSiteId, consumerInvoiceNumber,
        numFolder,
        false, loading
      );
      this.ecoSupportService.SaveUpdateClaimResponse$.subscribe(
        (data) => {
          this.show("Les modifications ont bien été enregistrées.", "success");
          if (data.ResponseData) {
            this.store.setAiInvoice(requestData)
          }
          if (data?.ResponseData?.ValidationErrors?.length > 0) {
            this.errors = data.ResponseData.ValidationErrors;
            this.hundelErrors(this.errors);
            this.store.setErrors(this.errors)
            this.content.scrollToTop(1500);
          }
          this.getstatut(this.claimId);
          loading.dismiss();
        },
        (err) => {
          loading.dismiss();
          this.show("Impossible de sauvegarder les modifications.", "danger");
        }
      );
    }
  }

  async sendClaim() {
    this.googleAnalyticsEffect.onClaimComplete();
    const loading = await this.loadingCtrl.create({ message: 'Chargement..' });
    await loading.present();
    const endDateRepair = this.facturationForm.value.RepairDate;
    const consumerInvoiceNumber = this.facturationForm.value.ConsumerInvoiceNumber;
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
          Amount: this.facturationForm.get('TotalAmountInclVAT')?.value || 0,
          Currency: 'EUR',
        },
        SupportAmount: {
          Amount: Number(this.store.getSupportAmount()),
          Currency: 'EUR',
        }
      }
    };
    this.ecoSupportService.updateClaim(
      Number(this.claimId), requestData, endDateRepair,
      repairSiteId, consumerInvoiceNumber,
      numFolder, true, loading
    );
    this.ecoSupportService.SendUpdateClaimResponse$.subscribe(
      (data) => {
        if (data.ResponseData) {
          this.store.setAiInvoice(requestData)
        }
        if (data?.ResponseData?.ValidationErrors?.length > 0) {
          this.errors = data.ResponseData.ValidationErrors;
          this.hundelErrors(this.errors);
          this.store.setErrors(this.errors);
          this.getstatut(this.claimId);
          this.content.scrollToTop(1500);
        } else {
          this.router.navigate([RoutesPaths.SUCCESS]);
        }
        loading.dismiss();
      },
      (err) => {
        loading.dismiss();
      }
    );


  }

  hundelErrors(errors: any) {
    errors.forEach((error: any) => {
      switch (error.Field) {
        case "Numéro de série": this.infoProductForm.get('serialNumber')?.setErrors({});
          break;
        case "Numéro de facture": this.facturationForm.get('ConsumerInvoiceNumber')?.setErrors({ customError: error.ErrorMessage });
          break;
        case "Date de réparation": this.facturationForm.get('RepairDate')?.setErrors({ required: true, customError: error.ErrorMessage });
          break;
      }
    });
    this.userForm.markAllAsTouched();
    this.infoProductForm.markAllAsTouched();
    this.facturationForm.markAllAsTouched();
  }

  addError(field: string, message: string) {
    this.errors = [...this.errors, { Field: field, ErrorMessage: message }]
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
       }
      }else {
        this.show("Facture introuvable","danger")
      }
       this.loading = false;
  }, err => {       this.loading = false;
    this.show("Facture introuvable","danger")});
}

}
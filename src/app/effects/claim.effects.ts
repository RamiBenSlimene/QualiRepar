import { Injectable } from '@angular/core';
import { DataStore } from '../helpers/data.store';
import { EcoSupportService } from '../services/eco-support.service';
import { AttachedFile, ClaimRequest } from '../types/claim-request';
import { ApiResponse } from '../types/api-response';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { Attachement } from '../types/attachement';
import { RepairSites } from '../types/site';
import { ProductTypeWithLabel, SubList } from '../types/product-type';

@Injectable({
  providedIn: 'root',
})
export class ClaimEffects {
  constructor(
    private readonly ecoSupportService: EcoSupportService,
    private readonly store: DataStore,
    private loadingCtrl: LoadingController

  ) {}

  async createEmptyClaimAndUploadAttachement(eventData: { fileContent: string; title: string } , loading : HTMLIonLoadingElement) { 
    this.ecoSupportService.getRepairSitesList().pipe(
        tap((response: ApiResponse<RepairSites> | null) => {
          if (response) {
            this.ecoSupportService.createEmptyClaim(response.ResponseData[0].SiteId)
              .subscribe(
                (data) => {
                  const claimid = data?.ResponseData.ClaimId;
                  if (claimid) {
                    this.store.setClaimId(claimid.toString());
                    this.uplodeAttachementWithClaimId(claimid, eventData, loading);
                  }
                },
                (err) => { 
                  this.ecoSupportService.createEmptyClaim(response.ResponseData[1].SiteId)
                    .subscribe((data) => {
                        const claimid = data?.ResponseData.ClaimId;
                        if (claimid) {
                          this.store.setClaimId(claimid.toString());
                          this.uplodeAttachementWithClaimId(claimid, eventData, loading);
                        }
                      },
                      (err) => {
                        if (response.ResponseData[2].SiteId) {
                          this.ecoSupportService
                            .createEmptyClaim(response.ResponseData[2].SiteId)
                            .subscribe((data) => {
                              const claimid = data?.ResponseData.ClaimId;
                              if (claimid) {
                                this.store.setClaimId(claimid.toString());
                                this.uplodeAttachementWithClaimId(claimid, eventData, loading);    
                              }
                            });
                        }
                      }
                    );
                }
              );
          }
        })
      )
      .subscribe();
  }
  async uplodeAttachementWithClaimId(claimId: number, eventData: { fileContent: string; title: string }, loading : HTMLIonLoadingElement) {
    const fileContent = { FileContent: eventData.fileContent.split(',')[1] };
    const title = this.getDocumentEnumFromType(eventData.title);
    const fileName = this.generateUniqueFilename(title);
    this.ecoSupportService
      .attachFile(claimId, fileName, 'jpeg', title, fileContent)
      .subscribe(
        data =>  loading.dismiss(),
        err =>  loading.dismiss()
      );
  }
  createEmptyClaim() {
    this.ecoSupportService.getRepairSitesList().pipe(
        tap((response: ApiResponse<RepairSites> | null) => {
          if (response) {
            this.ecoSupportService.createEmptyClaim(response.ResponseData[0].SiteId)
              .subscribe(
                (data) => {
                  const claimid = data?.ResponseData.ClaimId;
                  if (claimid) {
                    this.store.setClaimId(claimid.toString());
                  }
                },
                (err) => { 
                  this.ecoSupportService.createEmptyClaim(response.ResponseData[1].SiteId)
                    .subscribe((data) => {
                        const claimid = data?.ResponseData.ClaimId;
                        if (claimid) {
                          this.store.setClaimId(claimid.toString());
                        }
                      },
                      (err) => {
                        if (response.ResponseData[2].SiteId) {
                          this.ecoSupportService
                            .createEmptyClaim(response.ResponseData[2].SiteId)
                            .subscribe((data) => {
                              const claimid = data?.ResponseData.ClaimId;
                              if (claimid) {
                                this.store.setClaimId(claimid.toString());
                              }
                            });
                        }
                      }
                    );
                }
              );
          }
        })
      )
      .subscribe();
  }
  async uplodeAttachement(eventData: { fileContent: string; title: string }, loading? : HTMLIonLoadingElement) {
    const fileContent = { FileContent: eventData.fileContent.split(',')[1] };
    const title = this.getDocumentEnumFromType(eventData.title);
    const fileName = this.generateUniqueFilename(title);
    const claimId = this.store.getClaimtId();

    const loading2 = await this.loadingCtrl.create({ message: 'Chargement..' });
    if (!loading) {
      loading2.present();
    }

    this.ecoSupportService
      .attachFile(Number(claimId), fileName, 'jpeg', title, fileContent)
      .subscribe(
        (data) => {
          if (loading) {
            loading.dismiss();
          }
          if (loading2) {
            loading2.dismiss();
          }
        },
        (err) => {
          if (loading) {
            loading.dismiss();
          }
          if (loading2) {
            loading2.dismiss();
          }
        }
      );
  }
  uplodeAttachementWithoutLoader(attachement : Attachement): Observable<any> {
    if(attachement.type && attachement.name && attachement.body){
      const fileContent = { FileContent: attachement.body.split(',')[1] };
      const title = this.getDocumentEnumFromType(attachement.type);
      const fileName = this.generateUniqueFilename(title);
      const extention = this.getFileExtension(attachement.name);
      const claimId = this.store.getClaimtId();
      return this.ecoSupportService.attachFile(Number(claimId), fileName, extention, title, fileContent);
    } else  return of(null)
  }
  getDocumentEnumFromType(title: string): string {
    switch (title.toLowerCase()) {
      case 'validation manuscrite':
        return 'CONSUMERVALIDATION';
      case 'plaque signalétique':
        return 'NAMEPLATE';
      case 'facture':
        return 'INVOICE';
      case 'importer la facture':
        return 'INVOICE';
        case 'modifier la facture':
          return 'INVOICE';
      default:
        return 'Unsupported document type';
    }
  }
  generateUniqueFilename(filename: string): string {
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(2);
    const uniqueFilename = `${filename}_${timestamp}_${randomId}`;
    return uniqueFilename;
  }
  getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return 'jpeg';
    }
    return filename.substring(lastDotIndex + 1);
  }
  mapClaim(claim : any) : ClaimRequest {
   const attachedFiles : AttachedFile [] = []
   claim.AttachedFiles.map( (c:any) => {
    if(c.ContentThumbnail !== "" && c.ContentThumbnail !== null) {
      const _attachedFile : AttachedFile = {
        ContentThumbnail: c.ContentThumbnail,
        FileName: c.FileName,
        Size: c.Size,
        FileTypeCode: c.FileTypeCode
      }
      attachedFiles.push(_attachedFile)
    }
   })
   const _claim : ClaimRequest = {
     Consumer: {
       Title: claim.ConsumerDto.CivilityId,
       LastName: claim.ConsumerDto.LastName,
       FirstName: claim.ConsumerDto.FirstName,
       StreetNumber: claim.ConsumerDto.StreetNumber,
       Address1: claim.ConsumerDto.Address1,
       Address2: claim.ConsumerDto.Address2,
       Address3: claim.ConsumerDto.Address3,
       Zip: claim.ConsumerDto.Zip,
       City: claim.ConsumerDto.City,
       Country: claim.ConsumerDto.CountryCode,
       Phone: claim.ConsumerDto.MobilePhone,
       Email: claim.ConsumerDto.Email,
       AutoValidation: false
     },
     Product: {
       ProductId: claim.ClaimExtend?.ProductCode,
       ProductLabel : claim.ModelLabel,
       BrandId:  claim.ClaimExtend?.BrandId,
       BrandLabel: claim.BrandLabel,
       CommercialRef: claim.ModelCommercialRef,
       SerialNumber: claim.ModelSerial,
       PurchaseDate: claim.OriginCreateDate,
       FailureIrisCode : claim.ClaimExtend?.FailureIrisCode,
       IRISCondition: claim.IrisCondition,
       IRISConditionEX: claim.IrisConditionEx,
       IRISSymptom: claim.IrisSymptom,
       IRISSection: claim.IrisSection,
       IRISDefault: claim.IrisDefault,
       IRISRepair: claim.IrisRepair,
       IRISFamily : claim.IrisRepair,
       FailureDescription: claim.ClaimExtend?.FailureDescription,
       DefectCode: '',
     },
     Quote: {
      ConsumerInvoiceNumber: claim.ContractNb,
      NumFolder : claim.ClaimCodeClient !== 'null' && claim.ClaimCodeClient !== null ? claim.ClaimCodeClient : '' ,
      RepairDate:claim.InterventionEndDate,
       LaborCost: {},
       SparePartsCost: {},
       TravelCost: {},
       TotalAmountExclVAT: {},
       TotalAmountInclVAT: {
        Amount :claim.ClaimExtend?.TotalRepairCostVATIn,
        Currency : "EUR"
       },
       SupportAmount: {
        Amount : claim.ClaimExtend?.SupportGrant,
        Currency : "EUR"
       }
     },
     RepairSite : {
      id : claim.ClaimSite?.RepairSiteId,
      name : claim.ClaimSite?.RepairSiteName
     },
     DepositSite : {
      id : claim.ClaimSite?.DepositSiteId,
      name : claim.ClaimSite?.DepositSiteCommercialName
     },
     AttachedFiles : attachedFiles,
     CreateDate : claim.CreateDate,
     StatusExportCode : claim.StatusExportCode
   }
   return _claim;
  }

  getCodesIrisList(productId: string): Observable<SubList[]> {
    return this.ecoSupportService.getProductTypeListWithLabel().pipe(
      map(data => {
        if (data) {
          const product = data.ResponseData.find((i: ProductTypeWithLabel) => i.ProductId === productId);
          return product?.RepairCodes ? product?.RepairCodes : [];
        } else {
          return [];
        }
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  
downloadInvoice(base64String: string, fileType: string) {
  const blob = this.base64ToBlob(base64String, fileType);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `facture.${fileType.split('/')[1]}`;
  link.click();
  window.URL.revokeObjectURL(url);
}

base64ToBlob(base64String: string, contentType: string): Blob {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

detectFileType(base64String: string): string {
  if (base64String.startsWith('/9j/')) {
    return 'image/jpeg';
  } else if (base64String.startsWith('iVBORw0KG')) {
    return 'image/png';
  } else if (base64String.startsWith('%PDF-')) {
    return 'application/pdf';
  } else {
    return 'unknown';
  }
}
}

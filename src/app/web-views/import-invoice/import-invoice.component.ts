import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ClaimEffects } from 'src/app/effects/claim.effects';
import { DataStore } from 'src/app/helpers/data.store';
import { ConverterService } from 'src/app/services/converter.service';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { FileService } from 'src/app/services/files.service';
import { RequestUploadEventPayload } from 'src/app/types/claim-request';
@Component({
  selector: 'app-import-invoice',
  templateUrl: './import-invoice.component.html',
  styleUrls: ['./import-invoice.component.scss'],
})
export class ImportInvoiceComponent {
  @Output() requestUploadedEvent = new EventEmitter<RequestUploadEventPayload>();
  fileToUpload: File | null = null;
  @ViewChild('fileImport') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly converterSevice: ConverterService,
    private readonly toastController: ToastController,
    private readonly fileService: FileService,
    private readonly ecoSupportService: EcoSupportService,
    private loadingCtrl: LoadingController,
    private readonly claimEffects: ClaimEffects,
    private readonly store: DataStore
  ) {}

  onSelectFile(event: any) {
    this.fileToUpload = null;
    this.fileToUpload = event.target.files[0];
    this.upload();
    this.fileInput.nativeElement.value = '';
  }
  upload() {
    const allowedImageExtensions = [
      'image/jpg',
      'image/jpeg',
      'image/jpe',
      'image/gif',
      'image/png',
      'image/webp',
    ];
    if (this.fileToUpload) {
      const extention = this.fileToUpload.type;
      if (extention == 'application/pdf') {
        this.uploadPdf();
      } else if (allowedImageExtensions.includes(extention)) {
        this.uploadImage();
      } else {
        this.show('Format invalide');
      }
    }
  }
  uploadPdf(): void {
    const formData = new FormData();
    formData.append('file', this.fileToUpload as Blob);
    this.fileService.convertPdfToImg(formData).subscribe(
      (response) => {
        this.convertAndUpload(
          `data:image/jpeg;base64,${response.base64List[0]}`,
          'jpeg'
        );
      },
      (error) => {
        this.show('Erreur lors de chargement du PDF');
      }
    );
  }

  uploadImage() {
    if (this.fileToUpload) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const base64String = reader.result as string;
          if (base64String) {
            this.convertAndUpload(base64String, 'jpeg');
          }
        }
      };
      reader.readAsDataURL(this.fileToUpload);
    }
  }

  async convertAndUpload(base64_image: string, fileType: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement..',
    });
    loading.present();
    this.converterSevice.convert_base64_image(base64_image, fileType).subscribe(
      async (response) => {
        const jsonString = response?.choices[0]?.message?.content;
        const cleanedJsonString = jsonString.replace(/```|json/g, '');
        this.createClaim(base64_image, loading,cleanedJsonString);
      },
      (error) => {
        loading.dismiss();
        console.error('Error converting to JSON:', error);
      }
    );
  }

  parseJsonString(jsonString: string): any {
    try {
      const parsedData = JSON.parse(jsonString);
      return parsedData;
    } catch (error) {
      console.error('Error parsing JSON string:', error);
      return null;
    }
  }
  async show(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
  }

  createClaim(base64_image: string, loading: HTMLIonLoadingElement, cleanedJsonString: string) {
    this.ecoSupportService.getRepairSitesList().subscribe(
      (response) => {
       this.callApiCreateClaim(base64_image,loading, response,0, cleanedJsonString)
      },
      (error) => {console.log(error)

        this.ecoSupportService.submitted = false;
        loading.dismiss();
      }
    );
  }
  callApiCreateClaim(base64_image: string, loading: HTMLIonLoadingElement, response:any,index: number, cleanedJsonString : string){
   
      if (index >= response.length) {
        loading.dismiss();
        return;
      }
      const site = response.ResponseData[index]
        if (site.SiteId) {
          this.ecoSupportService.createEmptyClaim(site.SiteId).subscribe(
            (data) => {
              const claimid = data?.ResponseData.ClaimId;
              if (claimid) {
                this.store.setClaimId(claimid.toString());
                this.claimEffects.uplodeAttachementWithClaimId(claimid,{ fileContent: base64_image, title: 'Importer la facture' }, loading);  
              }
              const request : RequestUploadEventPayload = {
                claimId : claimid?.toString(),
                claimRequest : this.parseJsonString(cleanedJsonString)
              }
              this.requestUploadedEvent.emit(request);
              this.ecoSupportService.submitted = false;
              loading.dismiss();
            },
            (error) => {console.log(error)
              this.callApiCreateClaim(base64_image, loading, response,index + 1, cleanedJsonString);
            }
          )
        }
      
  
}
}

import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ClaimEffects } from 'src/app/effects/claim.effects';
import { ConverterService } from 'src/app/services/converter.service';
import { DataImageService } from 'src/app/services/data.image.service';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { FileService } from 'src/app/services/files.service';
import { ClaimRequest } from 'src/app/types/claim-request';

@Component({
  selector: 'app-update-invoice',
  templateUrl: './update-invoice.component.html',
  styleUrls: ['./update-invoice.component.scss'],
})
export class UpdateInvoiceComponent  {
  @Output() requestUploadedEvent = new EventEmitter<ClaimRequest>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  fileToUpload: File | null = null;

  constructor(
    public photoService: DataImageService, private readonly converterSevice: ConverterService,
    private readonly toastController: ToastController, private readonly fileService : FileService,
    private readonly ecoSupportService: EcoSupportService, private loadingCtrl: LoadingController,
    private readonly claimEffects: ClaimEffects
  ) { }

  onSelectFile(event: any) {
    this.fileToUpload = null;
    this.fileToUpload = event.target.files[0];
    this.upload();
    this.fileInput.nativeElement.value = '';
  }
  upload(){
    const allowedImageExtensions = [
      "image/jpg",
      "image/jpeg",
      "image/jpe",
      "image/gif",
      "image/png",
      "image/webp"
    ];
    if (this.fileToUpload) {
      const extention = this.fileToUpload.type;
      if(extention == "application/pdf"){
        this.uploadPdf();
      }
      else if(allowedImageExtensions.includes(extention)){
        this.uploadImage();
      }else {
       this.show("Format invalide");
      }
     }
  }
  uploadPdf(): void {
    const formData = new FormData();
      formData.append('file', this.fileToUpload as Blob);
     this.fileService.convertPdfToImg(formData).subscribe(
        (response) => {
          this.convertImgTojson( `data:image/jpeg;base64,${response?.base64List[0]}`, 'jpeg');
        },
        (error) => {
          this.show("Erreur lors de chargement du PDF");
        }
      ); 
   }
 
  uploadImage(){
    if(this.fileToUpload){
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const base64String = reader.result as string;
          if(base64String){
            this.convertImgTojson(base64String, 'jpeg');
          }
        }
      }
      reader.readAsDataURL(this.fileToUpload);
    }
  }

  async convertImgTojson(base64_image: string, fileType: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement..'
    });
    loading.present();
    this.converterSevice.convert_base64_image(base64_image, fileType).subscribe(
      (response) => {
        const jsonString = response?.choices[0]?.message?.content;
        const cleanedJsonString = jsonString.replace(/```|json/g, '');
        this.requestUploadedEvent.emit(this.parseJsonString(cleanedJsonString));
        this.ecoSupportService.submitted = false
        loading.dismiss();
        this.claimEffects.uplodeAttachement( { fileContent: base64_image, title: 'Importer la facture' }, loading)
      },
      (error) => {
        loading.dismiss();
        console.error('Error converting to JSON:', error);
      }
    )
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
}

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { DataImageService } from 'src/app/services/data.image.service';
import { FileService } from 'src/app/services/files.service';
import { Attachement, AttachementType } from 'src/app/types/attachement';
@Component({
  selector: 'app-upload-attachement',
  templateUrl: './upload-attachement.component.html',
  styleUrls: ['./upload-attachement.component.scss'],
})
export class UploadAttachementComponent  {

  @Input() isUploaded:  boolean = false;
  @Output() uploadedAttachementEvent = new EventEmitter<{attachement: Attachement, loading: HTMLIonLoadingElement}>();
  @ViewChild('attachementInput') attachementInput!: ElementRef<HTMLInputElement>;
  attachement: File | null = null;
  type : AttachementType = AttachementType.plaque
  constructor(
    private readonly toastController: ToastController,
    private readonly fileService : FileService,
    private loadingCtrl: LoadingController
  ) { }

  async onSelectFile(event: any) {

    this.attachement = null;
    this.attachement = event.target.files[0];
    await this.upload();
    this.attachementInput.nativeElement.value = '';
  }
 async upload(){
    const loading = await this.loadingCtrl.create({
      message: 'Chargement..'
    });
    loading.present();
    const allowedImageExtensions = [
      "image/jpg",
      "image/jpeg",
      "image/jpe",
      "image/gif",
      "image/png",
      "image/webp",
      "application/pdf"
    ];
    if (this.attachement) {
        const extention = this.attachement.type;
        if(extention == "application/pdf"){
          this.uploadPdf(loading);
        }
        else if(allowedImageExtensions.includes(extention)){
          this.uploadImage(loading);
        }else {
        this.show("Format invalide")
        this.isUploaded = false;
        loading.dismiss();
        }
     }
  }
  uploadPdf(loading : HTMLIonLoadingElement): void {
    const formData = new FormData();
      formData.append('file', this.attachement as Blob);
      this.fileService.convertPdfToImg(formData).subscribe(
        (response) => {
          if(response.error == null && response.base64List[0]){
            this.uploadAttachement(`data:image/png;base64,${response.base64List[0]}`, loading);
          }else {
            this.dispatchError(loading);
          }
        },
        (error) => {
          this.dispatchError(loading);
        }
      ); 
   }
 
  uploadImage(loading : HTMLIonLoadingElement){
    if(this.attachement){
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const base64String = reader.result as string;
          if(base64String){
            this.uploadAttachement(base64String, loading);
          }else {
            this.dispatchError(loading);
          }
        }else {
          this.dispatchError(loading);
        }
      }
      reader.readAsDataURL(this.attachement);
    }
  }

  uploadAttachement(base64: string, loading : HTMLIonLoadingElement): void {
    const _attachement : Attachement = {
      name : this.attachement?.name,
      size : this.convertirEnKiloOctets(this.attachement?.size),
      type : AttachementType.plaque,
      body : base64
   }
    this.uploadedAttachementEvent.emit({ attachement :_attachement, loading: loading});
   }
 
   convertirEnKiloOctets(octets?: string | number): string {
    if(octets){
      const kiloOctets = Math.round(+octets / 1024);
      return kiloOctets.toString() + " KO";
    }else{
      return "";
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

  dispatchError(loading : HTMLIonLoadingElement){
    loading.dismiss();
    this.show("Erreur lors de chargement du PDF");
  }
 
}



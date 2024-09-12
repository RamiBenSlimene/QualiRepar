import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ClaimEffects } from 'src/app/effects/claim.effects';
import { ConverterService } from 'src/app/services/converter.service';
import { DataImageService, UserPhoto } from 'src/app/services/data.image.service';
import { EcoSupportService } from 'src/app/services/eco-support.service';
import { ClaimRequest } from 'src/app/types/claim-request';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})
export class UploadFileComponent {
  @Input({ required: true }) title!: string;
  @Input() FactureAttchementViaCompletion: boolean = false;
  @Output() requestUploadedEvent = new EventEmitter<ClaimRequest>();
  @Output() fileBase64Event = new EventEmitter<{ fileContent: string, title: string }>();
  factureLoaded: boolean = false;
  otherPieceLoaded: boolean = false;
  isUploadInProgress: boolean = false;
  photos: UserPhoto[] = [];
  photo!: UserPhoto;
  loading: boolean = false;
  showProgressBar: boolean = false;

  constructor(public photoService: DataImageService, private readonly converterSevice: ConverterService,
    private readonly ecoSupportService: EcoSupportService, private loadingCtrl: LoadingController,
    private readonly claimEffects: ClaimEffects) { }

  upload() {
    this.uploadFile()
  }

  async uploadFile() {
    if (this.title == 'Modifier la facture' ) {
      await this.photoService.getFromGallery();
      await this.photoService.loadOne();
      this.photo = this.photoService.photo;
     
      if (this.photo.webviewPath) {
        this.convertImgTojson(this.photo.webviewPath, 'jpeg');
        const title = this.title;
        const fileContent = this.photo.webviewPath;
        this.fileBase64Event.emit({ fileContent, title });
      }
    }else if(this.title == 'Importer la facture'){
      await this.photoService.getFromGallery();
      await this.photoService.loadOne();
      this.photo = this.photoService.photo;
      if (this.photo.webviewPath) {
        this.convertAndUpload(this.photo.webviewPath, 'jpeg');
        const title = this.title;
        const fileContent = this.photo.webviewPath;
        this.fileBase64Event.emit({ fileContent, title });
      }
    }    
    else {
      await this.photoService.getFromGallery();
      await this.photoService.loadOne();
      this.photo = this.photoService.photo
      if (this.photo.webviewPath) {
        const title = this.title
        const fileContent = this.photo.webviewPath
        this.fileBase64Event.emit({ fileContent, title });
        this.otherPieceLoaded = true;
      }
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
        this.factureLoaded = true;
        loading.dismiss();
        this.claimEffects.uplodeAttachement( { fileContent: base64_image, title: 'Importer la facture' }, loading)
      },
      (error) => {
        loading.dismiss();
        console.error('Error converting to JSON:', error);
      }
    )
  }

  async convertAndUpload(base64_image: string, fileType: string) {
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
        this.factureLoaded = true;
        loading.dismiss();
        this.claimEffects.createEmptyClaimAndUploadAttachement({ fileContent: base64_image, title: 'Importer la facture' }, loading)
      },
      (error) => {
        loading.dismiss()
        console.error('Error converting to JSON:', error);
      }
    )
  }

  async getOne() {
    await this.photoService.loadOne();
    this.photo = this.photoService.photo
    return this.photo;
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

  async getAll() {
    await this.photoService.loadSaved();
    this.photos = this.photoService.photos
  }

}
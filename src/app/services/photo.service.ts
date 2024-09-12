import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, FilesystemDirectory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Observable } from 'rxjs';

import { Plugins} from '@capacitor/core';
const { Filesystems, Storage, Device } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class PhotoService {
 
}


export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
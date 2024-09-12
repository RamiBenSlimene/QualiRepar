import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
  })
  export class FileService {
    constructor(private http: HttpClient){

    }
    convertPdfToImg(formData : FormData){
     return this.http.post<any>(`${environment?.apiQRF}Invoice/convertToBase64Image`, formData)
    }
  }
  
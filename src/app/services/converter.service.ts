import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConverterService {
  constructor(private http: HttpClient) { }

  convert_base64_image(base64_image: string, fileType: string) {
    const body = {
      "model": "gpt-4-vision-preview",
      "messages": [
        {
          "role": "system",
          "content": "You are a helpful assistant. Your response should be in JSON format."
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Please convert the invoice from the image to JSON in the following format:
              {
                "Consumer": {
                  "LastName": "",
                  "FirstName": "",
                  "Address1": "",
                  "Zip": "",
                  "City": "",
                  "Phone": "",
                  "Email": ""
                },
                "Quote": {
                  "ConsumerInvoiceNumber": "",
                  "RepairDate": "",
                  "TotalAmountInclVAT": {
                    "Amount": "",
                    "Currency": ""
                  }
                },
                "Product": {
                  "CommercialRef": "",
                  "SerialNumber": ""
                }
              }
          
              Requirements:
              1. City: Must be located in France.
              2. Zip: Must be a valid postal code in France.
              3. TotalAmountInclVAT: Must be the total amount of the invoice including taxes, but excluding the "bonus de réparation" (repair bonus) amount.
              4. RepairDate: Must be converted to the yyyy-MM-dd format.
              5. CommercialRef: The CommercialRef is the reference of the product may appear as (Référence), (Ref) or (Reference) on the header of the table. 
              6. SerialNumber: The serial number or IMEI of the product.
              7. Consumer: The customer details should be extracted from the section labeled as "Customer", "Client", or similar.
              Please return only the JSON in the specified format without any additional text or explanation.
              `
            },
            {
              "type": "image_url",
              "image_url": {
                "url": `${base64_image}`
              }
            }
          ]
        }
      ],
      "max_tokens": 1500
    }
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${environment.openAiKey}`
    });
    return this.http.post<any>(environment.apiOpenAi, body, { headers })
  }

}


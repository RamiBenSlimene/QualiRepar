import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Brands } from '../types/brand';
import { ApiResponse } from '../types/api-response';
import { ProductTypes, ProductTypeWithLabel } from '../types/product-type';
import { ClaimRequest, CreateClaimRequest } from '../types/claim-request';
import { LoginForm } from '../types/login.form';
import { DataStore } from '../helpers/data.store';
import { ClaimResponse } from '../types/claim-response';
import { Claims } from '../types/Claim';
import { DepotSites, RepairSites } from '../types/site';

@Injectable({
  providedIn: 'root',
})
export class EcoSupportService {
  FactureAttchementViaCompletion: boolean = true;
  selectedFiles: { fileContent: string; title: string }[] = [];
  submitted: boolean = false;
  attachmentInProgress = false;
  private attachmentsPending = 0;

  //the update claim response
  private SaveUpdateClaimResponseSubject = new Subject<any>();
  SaveUpdateClaimResponse$ = this.SaveUpdateClaimResponseSubject.asObservable();

  private SendUpdateClaimResponseSubject = new Subject<any>();
  SendUpdateClaimResponse$ = this.SendUpdateClaimResponseSubject.asObservable();

  updateQueue: any[] = [];

  constructor(
    private readonly httpClient: HttpClient,
    private readonly store: DataStore
  ) { }

  getBrandList(): Observable<ApiResponse<Brands> | null> {
    return this.httpClient
      .get<ApiResponse<Brands>>(`${environment?.apiEcoSupport}printbrandlist`, {
        observe: 'response',
      })
      .pipe(map((res: HttpResponse<ApiResponse<Brands>>) => res.body));
  }

  getProductTypeList(): Observable<ApiResponse<ProductTypes> | null> {
    return this.httpClient
      .get<ApiResponse<ProductTypes>>(
        `${environment?.apiEcoSupport}printproducttypelist`,
        { observe: 'response' }
      )
      .pipe(map((res: HttpResponse<ApiResponse<ProductTypes>>) => res.body));
  }

  getProductTypeListWithLabel(): Observable<ApiResponse<ProductTypeWithLabel[]> | null> {
    return this.httpClient
      .get<ApiResponse<ProductTypeWithLabel[]>>(
        `${environment?.apiEcoSupport}printproducttypewithlabellist`,
        { observe: 'response' }
      )
      .pipe(map((res: HttpResponse<ApiResponse<ProductTypeWithLabel[]>>) => res.body));
  }

  getRepairSitesList(): Observable<ApiResponse<RepairSites> | null> {
    return this.httpClient
      .get<ApiResponse<RepairSites>>(
        `${environment?.apiEcoSupport}getrepairsitesbyats`,
        { observe: 'response' }
      )
      .pipe(map((res: HttpResponse<ApiResponse<RepairSites>>) => res.body));
  }
  getDepotSitesList(): Observable<ApiResponse<DepotSites> | null> {
    return this.httpClient
      .get<ApiResponse<DepotSites>>(
        `${environment?.apiEcoSupport}getdepositsitesbyats`,
        { observe: 'response' }
      )
      .pipe(map((res: HttpResponse<ApiResponse<DepotSites>>) => res.body));
  }

  //GET /api/v2/ecosupport/calculateecosupport
  calculatEcoSupport(
    req: any,
    repairCode: string
  ): Observable<ApiResponse<any> | null> {
    const api = `${environment?.apiEcoSupport}calculateecosupport?totalAmountInclVAT=1000&totalAmountInclVATCurrency=EUR&brandId=${req.brandId}&productId=${req.productId}&repairCode=${repairCode}`;
    return this.httpClient
      .get<ApiResponse<any>>(api, { observe: 'response' })
      .pipe(map((res: HttpResponse<ApiResponse<any>>) => res.body));
  }
  createClaim(
    data: CreateClaimRequest,
    repairEndDate: string,
    repairSiteId: string,
    consumerInvoiceNumber: string,
    quoteNumber: string
  ): Observable<any> {
    const url = `${environment.apiEcoSupport}createclaim?requestId=null&repairEndDate=${repairEndDate}&repairSiteId=${repairSiteId}&consumerInvoiceNumber=${consumerInvoiceNumber}&quoteNumber=${quoteNumber}`;
    return this.httpClient.post(url, data);
  }

  updateClaim(
    claimId: number,
    requestData: ClaimRequest,
    repairEndDate: string,
    repairSiteId: string,
    consumerInvoiceNumber: string,
    quoteNumber: string,
    submit: boolean,
    loading: HTMLIonLoadingElement
  ): void {
    if (this.attachmentInProgress || this.attachmentsPending > 0) {
      const updateRequest = {
        claimId,
        requestData,
        repairEndDate,
        repairSiteId,
        consumerInvoiceNumber,
        quoteNumber,
      };
      this.updateQueue.push(updateRequest);
    } else {
      if (requestData.Product) {
        requestData.Product.IRISCondition = requestData.Product?.IRISFamily;
        requestData.Product.IRISDefault = requestData.Product?.IRISFamily;
        requestData.Product.IRISRepair = requestData.Product?.IRISFamily;
        requestData.Product.IRISSection = requestData.Product?.IRISFamily;
        requestData.Product.IRISSymptom = requestData.Product?.IRISFamily;
      }
      this.sendUpdateRequest(claimId, requestData, repairEndDate, repairSiteId, consumerInvoiceNumber, quoteNumber, submit, loading);
    }
  }

  private sendUpdateRequest(
    claimId: number,
    requestData: any,
    repairEndDate: string,
    repairSiteId: string,
    consumerInvoiceNumber: string,
    quoteNumber: string,
    submit: boolean,
    loading: HTMLIonLoadingElement
  ): void {
    const url = `${environment.apiEcoSupport}updateclaim?claimId=${claimId}&repairEndDate=${repairEndDate}&repairSiteId=${repairSiteId}&consumerInvoiceNumber=${consumerInvoiceNumber}&quoteNumber=${quoteNumber}&submit=${submit}`;

    this.httpClient.post(url, requestData).subscribe(
      (response) => {
        if (submit) {
          this.SendUpdateClaimResponseSubject.next(response);

        } else {
          this.SaveUpdateClaimResponseSubject.next(response);

        }
      },
      (error) => {
        loading.dismiss();
        console.error('Error updating claim:', error);
      }
    );
  }

  login(form: LoginForm): Observable<string | null> {
    return this.httpClient
      .post<string>(environment?.apilogin, form, { observe: 'response' })
      .pipe(map((res: HttpResponse<string>) => res.body));
  }

  getEcoOrganization(
    brandId: string,
    productId: string
  ): Observable<ApiResponse<any> | null> {
    const api = `${environment?.apiEcoSupport}getecoorganization?brandId=${brandId}&productId=${productId}`;
    return this.httpClient.get<ApiResponse<any>>(api, { observe: 'response' })
      .pipe(map((res: HttpResponse<ApiResponse<any>>) => res.body));
  }

  createEmptyClaim(repairSiteId: string): Observable<ApiResponse<ClaimResponse> | null> {
    const param = {
      repairEndDate: "2023-12-22",
      repairSiteId: repairSiteId,
      consumerInvoiceNumber: Date.now()
    }
    const url = `${environment.apiEcoSupport}createclaim?repairEndDate=${param.repairEndDate}&repairSiteId=${param.repairSiteId}&consumerInvoiceNumber=${param.consumerInvoiceNumber}`;
    const data = {
      Consumer: {},
      Product: {
        ProductId: this.store.getProductId(),
        BrandId: Number(this.store.getBrandId()),
      },
      Quote: {
        LaborCost: {},
        SparePartsCost: {},
        TravelCost: {},
        TotalAmountExclVAT: {},
        TotalAmountInclVAT: {},
        SupportAmount: {
          Amount: Number(this.store.getSupportAmount()),
          Currency: 'EUR',
        },
      },
    };
    return this.httpClient.post<ApiResponse<ClaimResponse>>(url, data, { observe: 'response' }).pipe(
      map((res: HttpResponse<ApiResponse<ClaimResponse>>) => res.body));
  }

  getWarrantyClaims(manufacturerId: string): Observable<ApiResponse<Claims> | null> {
    return this.httpClient
      .get<ApiResponse<Claims>>(
        `${environment?.apiRepair}getwarrantyclaims?manufacturerId=${manufacturerId}`,
        { observe: 'response' }
      )
      .pipe(map((res: HttpResponse<ApiResponse<Claims>>) => res.body));
  }
  getClaimById(id: string): Observable<ApiResponse<any> | null> {
    return this.httpClient
      .get<ApiResponse<any>>(
        `${environment?.apiEcoSupport}ecogetwarrantyclaim?warrantyClaimId=${id}&language=Fran%C3%A7ais`,
        { observe: 'response' }
      )
      .pipe(map((res: HttpResponse<ApiResponse<any>>) => res.body));
  }
  //Files attachement Process
  attachFile(
    claimId: number,
    fileName: string,
    fileExtension: string,
    documentType: string,
    fileContent?: any
  ): Observable<any> {
    this.attachmentInProgress = true;
    this.attachmentsPending++;
    return this.httpClient.post<any>(
      `${environment?.apiEcoSupport}attachfile?ClaimId=${claimId}&fileName=${fileName}&fileExtension=${fileExtension}&documentType=${documentType}`,
      fileContent
    ).pipe(
      map((response) => {
        // After attachment completed
        this.handleAttachmentCompleted();
        return response;
      })
    );
  }

  handleAttachmentCompleted() {
    this.attachmentsPending--; //count pending attachments

    if (this.attachmentsPending === 0) {
      // If all attachments are completed, handle the update
      this.attachmentInProgress = false;

      if (this.updateQueue.length > 0) {
        // this.updateQueue.forEach((updateRequest) => {
        //   this.sendUpdateRequest(
        //     updateRequest.claimId,
        //     updateRequest.requestData,
        //     updateRequest.repairEndDate,
        //     updateRequest.repairSiteId,
        //     updateRequest.consumerInvoiceNumber,
        //     updateRequest.quoteNumber
        //   );
        // });

        this.updateQueue = [];
      }
    }


  }
  // GET Codes & Villes
  getAllHexaPoste(): Observable<any> {
    return this.httpClient.get<any>(`${environment?.warrantyUri}consumer/GetAllHexaPoste`, { observe: 'response' })
      .pipe(map((res: any) => res.body));
  }

  getCityFromHexaPoste(countryCode: string, hexaPost: string): Observable<any> {
    return this.httpClient.get<any>(`${environment?.warrantyUri}consumer/GetCityFromHexaPoste?countryCode=${countryCode}&hexaPost=${hexaPost}`, { observe: 'response' })
      .pipe(map((res: any) => res.body));
  }
  getValidators(manufacturerId: string, validatorTypeCode: string, countryCode: number): Observable<any> {
    return this.httpClient.get<any>(`${environment?.apiEcoSupport}getvalidators?manufacturerId=${manufacturerId}&validatorTypeCode=${validatorTypeCode}&countryCode=${countryCode}`);
  }

  getClaimStatus(id: string): Observable<ApiResponse<any> | null> {
    return this.httpClient
      .get<ApiResponse<any>>(
        `${environment?.apiEcoSupport}getclaimstatus?claimId=${id}`,
        { observe: 'response' }
      )
      .pipe(map((res: HttpResponse<ApiResponse<any>>) => res.body));
  }


  // getBrandLists(): Observable<ApiResponse<Brands>| null> {
  //   return this.httpClient
  //     .get<ApiResponse<Brands>>('assets/temp/printbrandlist.json', { observe: 'response' })
  //     .pipe(map((res: HttpResponse<ApiResponse<Brands>>) => res.body));
  // }
  // getProductTypeLists(): Observable<ApiResponse<ProductTypes> | null> {
  //   return this.httpClient
  //     .get<ApiResponse<ProductTypes>>('assets/temp/printproducttypelist.json', { observe: 'response' })
  //     .pipe(map((res: HttpResponse<ApiResponse<ProductTypes>>) => res.body));
  // }

}

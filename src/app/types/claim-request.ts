export class CreateClaimRequest {
    Consumer!: {
        Title: number;
        LastName: string;
        FirstName: string;
        StreetNumber: string;
        Address1: string;
        Address2: string;
        Address3: string;
        Zip: string;
        City: string;
        Country: string;
        Phone: string;
        Email: string;
        AutoValidation: boolean;
    }
    Product!: {
        ProductId: string;
        BrandId: string;
        ProductLabel? :string;
        BrandLabel? : string;
        CommercialRef: string;
        SerialNumber: string;
        PurchaseDate: string;
        FailureIrisCode? : string;
        IRISCondition: string;
        IRISConditionEX: string;
        IRISSymptom: string;
        IRISSection: string;
        IRISDefault: string;
        IRISRepair: string;
        FailureDescription: string;
        DefectCode: string;
    }
    Quote!: {
        NumFolder? : string;
        ConsumerInvoiceNumber?: string;
        RepairDate?: string;
        LaborCost: Ammount;
        SparePartsCost: Ammount;
        TravelCost: Ammount;
        TotalAmountExclVAT: Ammount;
        TotalAmountInclVAT: Ammount;
        SupportAmount:Ammount;
    }
    SpareParts?: SpareParts[];
    CreateDate? : string
}
export interface ClaimRequest {
    Consumer?: Consumer;
    Product?: Product;
    Quote?: Quote;
    SpareParts?: SpareParts[];
    AttachedFiles? : AttachedFile[];
    RepairSite? : {
        id?: string;
        name? : string;
    };
    DepositSite? : {
        id?: string;
        name? : string;
    };
    CreateDate? : string;
    StatusExportCode? :string
}

export interface Quote {
    NumFolder?: string;
    ConsumerInvoiceNumber?: string;
    RepairDate?: string;
    LaborCost: Ammount;
    SparePartsCost: Ammount;
    TravelCost: Ammount;
    TotalAmountExclVAT: Ammount;
    TotalAmountInclVAT: Ammount;
    SupportAmount:Ammount;
}
export interface Consumer {
    Title: number;
    LastName: string;
    FirstName: string;
    StreetNumber: string;
    Address1: string;
    Address2: string;
    Address3: string;
    Zip: string;
    City: string;
    Country: string;
    Phone: string;
    Email: string;
    AutoValidation: boolean;
}
export interface Product {
    ProductId: string;
    ProductLabel: string;
    BrandLabel: string;
    BrandId: string;
    CommercialRef: string;
    SerialNumber: string;
    PurchaseDate: string;
    FailureIrisCode: string;
    IRISCondition: string;
    IRISConditionEX: string;
    IRISSymptom: string;
    IRISSection: string;
    IRISDefault: string;
    IRISRepair: string;
    IRISFamily : string;
    FailureDescription: string;
    DefectCode: string;
    depositSiteId? : string;
    repairSiteId? : string;
}
export interface Ammount {
    Amount?: number;
    Currency?: string;
}
export interface SpareParts {
    Partref: string;
    Quantity: number;
    Status: string;
}

export interface AttachedFile {
    FileName? : string;
    Size? : string;
    ContentThumbnail? : string;
    FileTypeCode? : string;
}

export interface RequestUploadEventPayload {
    claimRequest: ClaimRequest;
    claimId?: string ;  
  }
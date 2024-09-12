import { LastStatus } from "../enums/labelStatus";

export interface Claim {
     ClaimId?: number;
     ClaimCodeClient?: number;
     LastStatus?: LastStatus;
     ManufacturerComment?: string;
     CreateDate?:   string ;
     ModelCommercialRef?: string;
     ModelTechnicalRef?:  string;
     BrandLabel?:  string ;
     ModelLabel?: string ;
     FamilyLabel?: string;
     ModelSerial?: string;
     EcoOrganisme? : string;
  }
  export type Claims = Claim[];

  export interface ClaimStat {
   title:string;
   count: number;
   claims: Claims;
   active: boolean;
  }
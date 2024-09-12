
export interface Attachement {
    name? : string ;
    size? : string;
    type? : AttachementType;
    lastUpdate? : Date;
    body? : any;
}

export enum AttachementType{
    validation = "VALIDATION MANUSCRITE",
    plaque = "PLAQUE SIGNALÉTIQUE"
}
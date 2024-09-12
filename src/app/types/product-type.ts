export interface ProductType {
        ProductId: string;
        ProductName: string;
        EligibilityStartDate: string;
        EligibilityEndDate: string;
        RepairCodes: [string];
        IRISSymtoms: [string];
}

export type ProductTypes = ProductType[];
export interface ProductTypeWithLabel {
        ProductId: string;
        ProductName: string;
        EligibilityStartDate: string;
        EligibilityEndDate: string;
        RepairCodes: SubList[];
        IRISSymtoms: SubList[];
}
export interface SubList {
        Code : string;
        Label : string;
}
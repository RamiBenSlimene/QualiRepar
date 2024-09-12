export class RepairSite {
    SiteId!: string;
    Name!: string;
    CommercialName!: string;
    Zip!: string;
    City!: string;

}
export type RepairSites = RepairSite[];

export class DepotSite {
    SiteId!: string;
    Name!: string;
    CommercialName!: string;
    Zip!: string;
    City!: string;

}
export type DepotSites = RepairSite[];
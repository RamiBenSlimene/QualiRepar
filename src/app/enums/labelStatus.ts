export enum LastStatus {
  CLOSEDACCEPTED = 'CLOSEDACCEPTED',
  NOTCONFORM = 'NOTCONFORM',
  REFUSED = 'REFUSED',
  ACCEPTED = 'ACCEPTED',
  VALID = 'VALID',
  NOTVALID = 'NOTVALID',
  CANCELLED = "CANCELLED",
  ARBITRATION = "ARBITRATION",
  WAITING = "WAITING"
}
export interface StatusDescriptions {
    [key: string]: string;
}


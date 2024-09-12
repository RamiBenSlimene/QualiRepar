export interface ClaimResponse {
  ClaimId: number;
  IsValid: boolean;
  ValidationErrors: ValidationErrors[];
}
export interface ValidationErrors{
  Field: string;
  ErrorMessage : string;
  MessageType : string;
}
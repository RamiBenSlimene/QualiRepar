export interface ValidationError {
    Field? : string;
    ErrorMessage? : string;
}
export type ValidationErrors = ValidationError[];

export interface ErrorDetail {
    Message: string;
    Severity: number;
    ValidationMessageKey: string;
    ValidatorName: string;
    Code : string;
  }
  
  export interface Errors {
    [key: string]: ErrorDetail;
  }
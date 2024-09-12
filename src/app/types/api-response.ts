export interface ApiResponse<T> {
  ResponseData: T;
  ResponseStatus: string;
  IsValid: boolean;
  ResponseMessage: string;
  ResponseErrorMessage: string;
}

export type ApiError = {
    [field: string]: string | string[];
  };

  export type ApiSuccess = {
    [field: string]: string | string[];
  };
  

// export type DataResponse<T> = {
//     data: T;
//     success: boolean;
//     message: string;
//     errors?: ApiError;
//   };
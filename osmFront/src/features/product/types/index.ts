export interface ProductForginKeyConfigType {
    name:string,
    label?:string,
    role:string,
    filter:string,
    subFilter?:string,
    title?:string,
    entityName:string,
    fieldName:string,
    type?:string,
    placeholder?:string,
    required:boolean,
    options?:any[],
    mapOnly?:boolean,  // use to map only the data without any other data
  }

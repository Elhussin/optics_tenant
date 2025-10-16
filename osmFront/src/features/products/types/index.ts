export interface ProductConfigType {
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
    options?:{ label: string; value: string | number }[];
    mapOnly?:boolean,  
    defaultValue?:any,
    className?:string,
    // onChange?: (value: any) => void,
  }



export interface FieldsProps {
    fieldRow:ProductConfigType,
    field: any;
}

export interface SelectFieldsProps extends FieldsProps {
    options: { label: string; value: string | number }[];
}

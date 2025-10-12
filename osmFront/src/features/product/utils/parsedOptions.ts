
export const parsedOptions= (data:any,filter:string ,mapOnly=false ,fieldName:string)=>{

    if(mapOnly){
      return data.map((v: any) => ({ label: v[fieldName], value: v.id })) || []
    }
    return data?.filter((v: any) => v[fieldName] === filter).map((v: any) => ({ label: v.label|| v.value, value: v.id })) || []
  
  }
  
  
  
  
  
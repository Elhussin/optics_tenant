import API from "@/src/lib/api-client";
import { RegisterFormData } from "@/src/types/tenant";

export async function registerTenant(data: RegisterFormData) {
  const res = await API.post("/api/tenants/register/", data);
  return res.data;
}


export async function activeTenant(){
  
}
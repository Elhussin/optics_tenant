import API from "@/lib/api-client";
import { RegisterFormData } from "@/types/tenant";

export async function registerTenant(data: RegisterFormData) {
  const res = await API.post("/api/tenants/register/", data);
  return res.data;
}


export async function activeTenant(){
  
}
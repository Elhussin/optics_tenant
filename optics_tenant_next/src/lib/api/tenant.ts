import api from "@/src/lib/zodios-client";
import { RegisterFormData } from "@/src/types/tenant";


export async function registerTenant(data: RegisterFormData) {
  const res = await (api.post as any)("/api/tenants/register/", data);
  return res;
}



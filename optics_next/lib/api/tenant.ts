interface RegisterTenantRequest {
    id: number;
    name: string;
    email: string;
    password: string;
    plan: string;
    max_users: number;
    max_products: number;
}

import { z } from "zod";


const PlanEnum = z.enum(["basic", "premium", "enterprise"]);
const RegisterTenantRequest = z
  .object({
    id: z.number().int(),
    name: z.string().min(5),
    email: z.string().email(),
    password: z.string().min(8),
    plan: PlanEnum,
    max_users: z.number().int().describe("Maximum number of users").default(5),
    max_products: z.number().int().describe("Maximum number of products").default(1000),
  })
  .passthrough();
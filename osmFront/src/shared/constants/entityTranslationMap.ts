/**
 * Maps entity names to their translation file locations.
 * This allows dynamic entity loading while keeping files organized.
 * 
 * Usage:
 * - If entity is in this map, load from the specified file
 * - Otherwise, fall back to the entity name itself as namespace
 * 
 * Example:
 * "hrm-employees" -> loads from "forms/hrm"
 * "inventory" -> loads from "inventory" (not in map, uses entity name)
 */
export const ENTITY_TRANSLATION_MAP: Record<string, string> = {
    // HRM Module
    "hrm-departments": "forms/hrm",
    "hrm-employees": "forms/hrm",
    "hrm-employee-leave": "forms/hrm",
    "hrm-attendance": "forms/hrm",
    "hrm-performance-review": "forms/hrm",
    "hrm-payroll": "forms/hrm",
    "hrm-tasks": "forms/hrm",
    "hrm-notifications": "forms/hrm",

    // CRM Module
    "crm-customers": "forms/crm",
    "crm-customer-groups": "forms/crm",
    "crm-opportunities": "forms/crm",
    "crm-interactions": "forms/crm",
    "crm-complaints": "forms/crm",
    "crm-subscriptions": "forms/crm",
    "crm-tasks": "forms/crm",
    "crm-campaigns": "forms/crm",
    "crm-documents": "forms/crm",
    "crm-contacts": "forms/crm",

    // CRM Insurance & Claims
    "crm-insurance-claims": "forms/insurance",
    "crm-claim-items": "forms/insurance",
    "crm-claim-documents": "forms/insurance",
    "crm-customer-partner-links": "forms/insurance",
    "crm-partner-branches": "forms/insurance",
    "crm-partner-price-lists": "forms/insurance",
    "crm-partner-price-list-items": "forms/insurance",
    "crm-partner-settlements": "forms/insurance",

    // Products Module
    "products": "forms/products",
    "product-variants": "forms/products",
    "product-images": "forms/products",
    "flexible-prices": "forms/products",
    "lens-coatings": "forms/products",

    // Products Extended (Reviews, Q&A, Marketing, Transfers)
    "product-reviews": "forms/products-extended",
    "product-questions": "forms/products-extended",
    "product-answers": "forms/products-extended",
    "product-offers": "forms/products-extended",
    "product-marketing": "forms/products-extended",
    "product-stock-transfers": "forms/products-extended",
    "product-stock-transfer-items": "forms/products-extended",

    // Accounting Module
    "chart-of-accounts": "forms/accounting",
    "journal-entries": "forms/accounting",
    "financial-periods": "forms/accounting",
    "accounting-taxes": "forms/accounting",
    "accounting-categories": "forms/accounting",

    // Settings Module
    "users": "forms/settings",
    "roles": "forms/settings",
    "permissions": "forms/settings",
    "role-permissions": "forms/settings",
    "branches": "forms/settings",
    "branch-users": "forms/settings",
    "tenant-settings": "forms/settings",

    // Inventory & Operations Module
    "stocks": "forms/operations",
    "stock-movements": "forms/operations",
    "transfers": "forms/inventory",
    "branches-shift": "forms/operations",
    "product-supplier": "forms/operations",
    "invoices": "forms/operations",
    "sales-payments": "forms/operations",

    // Sales & Orders
    "orders": "forms/sales",
    "sales_installments": "forms/sales",
    "invoice-types": "forms/sales",
    "pricing-policies": "forms/products",

    // SaaS Module
    "clients": "forms/saas",
    "register-tenants": "forms/saas",
    "domains": "forms/saas",
    "payments": "forms/saas",
    "subscription-plans": "forms/saas",
    "contact_us": "forms/saas",

    // Partners & Suppliers
    "partners": "forms/partners",
    "suppliers": "forms/suppliers",
    "manufacturers": "forms/suppliers",
    "brands": "forms/suppliers",
    "categories": "forms/suppliers",
    "attributes": "forms/suppliers",
    "attribute-values": "forms/suppliers",

    // Misc
    "payment-methods": "forms/misc",
    "prescriptions": "forms/misc",
    "pages": "forms/misc",
};

/**
 * Get the translation namespace for an entity.
 * Returns the mapped file location or the entity name itself.
 */
export function getEntityTranslationNamespace(entity: string): string {
    return ENTITY_TRANSLATION_MAP[entity] || entity;
}

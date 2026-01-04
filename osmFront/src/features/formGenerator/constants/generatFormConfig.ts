import { GeneratorConfig, FieldTemplate, RelationshipConfig } from '@/src/shared/types/DynamicFormTypes';

export const defaultConfig: GeneratorConfig = {
  baseClasses: "w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm",
  labelClasses: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5",
  errorClasses: "text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1",
  submitButtonClasses: "w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2",
  submitButtonText: "Save",
  includeResetButton: true,
  spacing: "mb-0", // Spacing is handled by grid gap
  containerClasses: "grid grid-cols-1 md:grid-cols-2 gap-6"
};

export const fieldTemplates: Record<string, FieldTemplate> = {
  'email': { component: 'input', type: 'email' },
  'password': { component: 'input', type: 'password' },
  'url': { component: 'input', type: 'url' },
  'tel': { component: 'input', type: 'tel' },
  'number': { component: 'input', type: 'number' },
  'date': { component: 'input', type: 'date' },
  'datetime': { component: 'input', type: 'datetime-local' },
  'time': { component: 'input', type: 'time' },
  'textarea': { component: 'textarea', props: { rows: 2 } },
  'select': { component: 'select' },
  'checkbox': { component: 'input', type: 'checkbox', wrapper: 'checkbox' },
  'radio': { component: 'input', type: 'radio', wrapper: 'radio' },
  'file': { component: 'input', type: 'file' },
  'color': { component: 'input', type: 'color' },
  'range': { component: 'input', type: 'range' },
  'foreignkey': { component: 'select' },
  'union': { component: 'select' }
};

export const relationshipConfigs: RelationshipConfig = {
  client: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'clients'
  },
  register_tenant: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'register_tenants'
  },
  payment: {
    labelField: 'amount',
    valueField: 'id',
    searchField: 'amount',
    entityName: 'payments'
  },
  subscription_plan: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'subscription_plans'
  },
  role: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'roles',
    
  },
  user: {
    labelField: 'username',
    valueField: 'id',
    searchField: 'username',
    entityName: 'users',
  },
  permission: {
    labelField: 'code',
    valueField: 'id',
    searchField: 'code',
    entityName: 'permissions',
  },
  permission_ids: {
    labelField: 'code',
    valueField: 'id',
    searchField: 'code',
    entityName: 'permissions',
  },
  role_permission: {
    labelField: 'role',
    valueField: 'id',
    searchField: 'role',
    entityName: 'role-permissions',
  },
  contact_us: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'contact-us',
  },
  tenant_settings: {
    labelField: 'business_name',
    valueField: 'id',
    searchField: 'business_name',
    entityName: 'tenant-settings',
  },
  department: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'departments',
  },
    employee: {
    labelField: 'user_name',
    valueField: 'permission_ids',
    searchField: 'name',
    entityName: 'employees',
  },

  customer: {
    labelField: 'first_name',
    valueField: 'id',
    searchField: 'first_name',
    entityName: 'customers',
  },
  customer_groups: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'customer-groups',
  },
  customers: {
    labelField: 'first_name',
    valueField: 'id',
    searchField: 'first_name',
    entityName: 'customers',
  },
  opportunity: {
    labelField: 'title',
    valueField: 'id',
    searchField: 'title',
    entityName: 'opportunities',
  },
  prescription: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'prescriptions',
  },
  branch_user: {
    labelField: 'user_name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'branch-users',
  },
  branch: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'branches',
  },
  attribute: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'attributes',
  },
  attribute_value: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'attribute_values',
  },
  supplier: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'suppliers',
  },
  manufacturer: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'manufacturers',
  },
  brand: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'brands',
  },
  category: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'categories',
  },
  parent: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'categories',
  },
  lens_coating: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'lens-coatings',
  },
  product: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'products',
  },
  product_variant: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'product-variants',
  },
  product_image: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'product-images',
  },
  flexible_price: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'flexible-prices',
  },
  // Keep backwards compatibility or manual _id fields if necessary:
  client_id: {
    labelField: 'name',
    valueField: 'id',
    searchField: 'name',
    entityName: 'clients'
  },


};

export const ignoredFields: string[] = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'group', 'is_active', 'is_deleted', 'deleted_at', 'branch_code', 'logo', 'primary_color', 'secondary_color', 'paid_until'];


export const customConfig = {
  baseClasses: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
  labelClasses: "block text-sm font-semibold text-gray-800 mb-2",
  errorClasses: "text-red-600 text-sm mt-1 font-medium",
  submitButtonClasses: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl",
  spacing: "mb-6",
  containerClasses: "space-y-6 p-6 bg-white rounded-xl shadow-lg"
};

import { GeneratorConfig, FieldTemplate,RelationshipConfig } from '@/types/DynamicFormTypes';

export const defaultConfig: GeneratorConfig = {
    baseClasses: "input-text",
    labelClasses: "label",
    errorClasses: "error-text",
    submitButtonClasses: "btn btn-primary",
    submitButtonText: "Save",
    includeResetButton: true,
    spacing: "mb-4",
    containerClasses: "space-y-4"

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
    'textarea': { component: 'textarea', props: { rows: 3 } },
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
    user_id: {
      endpoint: 'users_users_list',
      labelField: 'username',
      valueField: 'id',
      searchField: 'username',
      createPage: '/dashboard/user/create'
    },
    category_id: {
      endpoint: 'hrm_categories_list',
      labelField: 'name',
      valueField: 'id',
      searchField: 'name',
      createPage: '/hrm/categories/create'
    },
    department_id: {
      endpoint: 'hrm_departments_list',
      labelField: 'name',
      valueField: 'id',
      searchField: 'name',
      createPage: '/hrm/department/create'
    },
    role_id: {
      endpoint: 'users_roles_list',
      labelField: 'name',
      valueField: 'id',
      searchField: 'name',
      createPage: '/dashboard/role/create'
    },
    page_id: {
      endpoint: 'pages_pages_list',
      labelField: 'slug',
      valueField: 'id',
      searchField: 'title',
      createPage: '/dashboard/pages/create'
    },
  
  };

export const ignoredFields : string[] = ['id', 'created_at', 'updated_at', 'owner', 'tenant', 'group', 'is_active', 'is_deleted', 'deleted_at' , 'branch_code','logo','primary_color','secondary_color','paid_until'];


export const customConfig = {
    baseClasses: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
    labelClasses: "block text-sm font-semibold text-gray-800 mb-2",
    errorClasses: "text-red-600 text-sm mt-1 font-medium",
    submitButtonClasses: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl",
    spacing: "mb-6",
    containerClasses: "space-y-6 p-6 bg-white rounded-xl shadow-lg"
  };

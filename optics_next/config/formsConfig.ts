type FormMode = 'create' | 'update';

interface FormConfig {
  schemaName: string;
  create: {
    creatAlias: string;
    title: string;
    successMessage: string;
    errorMessage: string;
  };
  update: {
    fetchAlias: string;
    updaeAlias: string;
    title: string;
    successMessage: string;
    errorMessage: string;
  };
  viewDetial: {
    fetchAlias: string;
    title: string;
    restoreAlias: string;
    hardDeleteAlias: string;
    fields: string[];
  };
}

// جميع الفورمات هنا
export const formsConfig: Record<string, FormConfig> = {
  supplier: {
    schemaName: 'SupplierRequest',
    create: {
      creatAlias: 'products_suppliers_create',
      title: 'Add Supplier',
      successMessage: 'Supplier created successfully',
      errorMessage: 'Failed to create supplier',
    },
    update: {
      fetchAlias: 'products_suppliers_retrieve',
      updaeAlias: 'products_suppliers_update',
      title: 'Update Supplier',
      successMessage: 'Supplier updated successfully',
      errorMessage: 'Failed to update supplier',
    },
    viewDetial: {
      fetchAlias: 'products_suppliers_retrieve',
      restoreAlias: 'products_suppliers_partial_update',
      hardDeleteAlias: 'products_suppliers_destroy',
      fields:["name","email","phone","address","is_active","is_deleted"],
      title: 'Supplier Details'
    },
  },

  department: {
    schemaName: 'Department',
    create: {
      creatAlias: 'hrm_departments_create',
      title: 'Add Department',
      successMessage: 'Department created successfully',
      errorMessage: 'Failed to create department',
    },
    update: {
      fetchAlias: 'hrm_departments_retrieve',
      updaeAlias: 'hrm_departments_update',
      title: 'Update Department',
      successMessage: 'Department updated successfully',
      errorMessage: 'Failed to update department',
    },
    viewDetial: {
      fetchAlias: 'hrm_departments_retrieve',
      restoreAlias: 'hrm_departments_partial_update',
      hardDeleteAlias: 'hrm_departments_destroy',
      fields:["name","description","is_active","is_deleted"],
      title: 'Department Details'

    },
  },
};

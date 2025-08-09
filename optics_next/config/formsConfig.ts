type FormMode = 'create' | 'update';

interface FormConfig {
  schemaName: string;
  create: {
    alias: string;
    title: string;
    successMessage: string;
    errorMessage: string;
  };
  update: {
    fetchAlias: string;
    alias: string;
    title: string;
    successMessage: string;
    errorMessage: string;
  };
}

// جميع الفورمات هنا
export const formsConfig: Record<string, FormConfig> = {
  supplier: {
    schemaName: 'SupplierRequest',
    create: {
      alias: 'products_suppliers_create',
      title: 'Add Supplier',
      successMessage: 'Supplier created successfully',
      errorMessage: 'Failed to create supplier',
    },
    update: {
      fetchAlias: 'products_suppliers_retrieve',
      alias: 'products_suppliers_update',
      title: 'Update Supplier',
      successMessage: 'Supplier updated successfully',
      errorMessage: 'Failed to update supplier',
    },
  },

  department: {
    schemaName: 'Department',
    create: {
      alias: 'hrm_departments_create',
      title: 'Add Department',
      successMessage: 'Department created successfully',
      errorMessage: 'Failed to create department',
    },
    update: {
      fetchAlias: 'hrm_departments_retrieve',
      alias: 'hrm_departments_update',
      title: 'Update Department',
      successMessage: 'Department updated successfully',
      errorMessage: 'Failed to update department',
    },
  },
};

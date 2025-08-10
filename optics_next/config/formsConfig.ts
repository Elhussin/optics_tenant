// type FormMode = 'create' | 'edit' | 'view';

// interface FormConfig {
//   schemaName: string;
//   create: {
//     createAlias: string;
//     title: string;
//     successMessage: string;
//     errorMessage: string;
//   };
//   edit: {
//     fetchAlias: string;
//     updateAlias: string;
//     title: string;
//     successMessage: string;
//     errorMessage: string;
//   };
//   view: {
//     fetchAlias: string;
//     title: string;
//     restoreAlias: string;
//     hardDeleteAlias: string;
//     fields: string[];
//   };
// }

// // جميع الفورمات هنا
// export const formsConfig: Record<string, FormConfig> = {
//   supplier: {
//     schemaName: 'SupplierRequest',
//     create: {
//       createAlias: 'products_suppliers_create',
//       title: 'Add Supplier',
//       successMessage: 'Supplier created successfully',
//       errorMessage: 'Failed to create supplier',
//     },
//     edit: {
//       fetchAlias: 'products_suppliers_retrieve',
//       updateAlias: 'products_suppliers_update',
//       title: 'Update Supplier',
//       successMessage: 'Supplier updated successfully',
//       errorMessage: 'Failed to update supplier',
//     },
//     view: {
//       fetchAlias: 'products_suppliers_retrieve',
//       restoreAlias: 'products_suppliers_partial_update',
//       hardDeleteAlias: 'products_suppliers_destroy',
//       fields:["name","email","phone","address","is_active","is_deleted"],
//       title: 'Supplier Details'
//     },
//   },

//   department: {
//     schemaName: 'Department',
//     createAlias: 'hrm_departments_create',
//     fetchAlias: 'hrm_departments_retrieve',
//     updateAlias: 'hrm_departments_partial_update',
//     hardDeleteAlias: 'hrm_departments_destroy',
//     createSuccessMessage: 'Department created successfully',
//     createErrorMessage: 'Failed to create department',
//     updateSuccessMessage: 'Department updated successfully',
//     updateErrorMessage: 'Failed to update department',
//     title: 'Department Details',
//     createTitle: 'Add Department',
//     updateTitle: 'Update Department',
//     fields:["name","description","is_active","is_deleted"],


//     // create: {
//     //   createAlias: 'hrm_departments_create',
//     //   title: 'Add Department',
//     //   successMessage: 'Department created successfully',
//     //   errorMessage: 'Failed to create department',
//     // },
//     edit: {
//       fetchAlias: 'hrm_departments_retrieve',
//       updateAlias: 'hrm_departments_update',
//       title: 'Update Department',
//       successMessage: 'Department updated successfully',
//       errorMessage: 'Failed to update department',
//     },
//     view: {
//       fetchAlias: 'hrm_departments_retrieve',
//       restoreAlias: 'hrm_departments_partial_update',
//       hardDeleteAlias: 'hrm_departments_destroy',
//       fields:["name","description","is_active","is_deleted"],
//       title: 'Department Details'

//     },
//   },
// };
interface FormConfig {
  schemaName: string;
  createAlias: string;
  retrieveAlias: string;
  updateAlias: string;
  hardDeleteAlias: string;
  createSuccessMessage: string;
  createErrorMessage: string;
  updateSuccessMessage: string;
  updateErrorMessage: string;
  title: string;
  detailsTitle: string;
  createTitle: string;
  updateTitle: string;
  fields: string[];
  DetailsField: {
    [key: string]: string;
  };
  listAlias: string;
}

export const formsConfig: Record<string, FormConfig> = {
  department: {
    schemaName: 'Department',
    createAlias: 'hrm_departments_create',
    listAlias: 'hrm_departments_list',
    retrieveAlias: 'hrm_departments_retrieve',
    updateAlias: 'hrm_departments_partial_update',
    hardDeleteAlias: 'hrm_departments_destroy',
    createSuccessMessage: 'Department created successfully',
    createErrorMessage: 'Failed to create department',
    updateSuccessMessage: 'Department updated successfully',
    updateErrorMessage: 'Failed to update department',
    title: 'Department',
    detailsTitle: 'Department Details',
    createTitle: 'Add Department',
    updateTitle: 'Update Department',
    fields:["name","description"],
    DetailsField:{
      name: "Department Name",
      description: "Department Description",
      is_active: "Department Is Active",
      is_deleted: "Department Is Deleted",
    },

  },
  supplier: {
    schemaName: 'SupplierRequest',
    listAlias: 'products_suppliers_list',
    createAlias: 'products_suppliers_create',
    retrieveAlias: 'products_suppliers_retrieve',
    updateAlias: 'products_suppliers_partial_update',
    hardDeleteAlias: 'products_suppliers_destroy',
    createSuccessMessage: 'Supplier created successfully',
    createErrorMessage: 'Failed to create supplier',
    updateSuccessMessage: 'Supplier updated successfully',
    updateErrorMessage: 'Failed to update supplier',
    title: 'Supplier',
    detailsTitle: 'Supplier Details',
    createTitle: 'Add Supplier',
    updateTitle: 'Update Supplier',
    fields:["name","email","phone"],
    DetailsField:{
      name: "Supplier Name",
      email: "Supplier Email",
      phone: "Supplier Phone",
      address: "Supplier Address",
      website: "Supplier Website",
      is_active: "User Is Active",
      is_deleted: "User Is Deleted",
    }
  },

};
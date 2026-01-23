/**
 * Mapping for raw permission codes to human-friendly names and descriptions.
 * This helps managers understand what each permission actually does.
 */

export interface PermissionDetail {
    name: string;
    description: string;
    category: string;
}

export const PERMISSION_MAPPING: Record<string, PermissionDetail> = {
    // Products
    view_products: {
        name: "View Products",
        description: "Allows viewing the product list and details.",
        category: "Products",
    },
    add_products: {
        name: "Add Products",
        description: "Allows creating new products in the system.",
        category: "Products",
    },
    change_products: {
        name: "Edit Products",
        description: "Allows modifying existing product information.",
        category: "Products",
    },
    delete_products: {
        name: "Delete Products",
        description: "Allows removing products from the system.",
        category: "Products",
    },

    // Users & Roles
    view_user: {
        name: "View Users",
        description: "Allows viewing the list of system users.",
        category: "Users",
    },
    add_user: {
        name: "Create Users",
        description: "Allows creating new staff and admin accounts.",
        category: "Users",
    },
    view_role: {
        name: "View Roles",
        description: "Allows viewing system roles and their permissions.",
        category: "Permissions",
    },
    change_role: {
        name: "Manage Roles",
        description: "Allows creating, editing, and deleting roles.",
        category: "Permissions",
    },

    // Sales & Wholesale
    view_wholesale_customer: {
        name: "View Wholesale Customers",
        description: "Allows viewing wholesale customer list and profiles.",
        category: "Wholesale",
    },
    add_wholesale_order: {
        name: "Create Wholesale Orders",
        description: "Allows creating and validating wholesale orders.",
        category: "Wholesale",
    },
    manage_wholesale_credit: {
        name: "Manage Credit Limits",
        description: "Allows updating customer credit limits and balances.",
        category: "Wholesale",
    },

    // Accounting
    view_chartofaccounts: {
        name: "View Chart of Accounts",
        description: "Allows viewing the financial structure and balances.",
        category: "Accounting",
    },
    add_generaljournal: {
        name: "Add Journal Entries",
        description: "Allows creating new accounting journal entries.",
        category: "Accounting",
    },
};

/**
 * Get friendly details for a permission code.
 * Falls back to formatting the code if no mapping is found.
 */
export const getPermissionDetails = (code: string): PermissionDetail => {
    if (PERMISSION_MAPPING[code]) {
        return PERMISSION_MAPPING[code];
    }

    // Fallback: convert "view_some_thing" to "View Some Thing"
    const formattedName = code
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const category = code.split("_")[1] || "General";

    return {
        name: formattedName,
        description: `Grants ${formattedName.toLowerCase()} access.`,
        category: category.charAt(0).toUpperCase() + category.slice(1),
    };
};

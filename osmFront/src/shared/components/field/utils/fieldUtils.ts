/**
 * ✨ Field Utilities - مجموعة دوال مساعدة للحقول
 * @description Utility functions for field management
 */

/**
 * Generate field name based on context
 */
export const getFieldName = (
    baseName: string,
    variantNumber?: number,
    attributeIndex?: number
): string => {
    if (variantNumber !== undefined && attributeIndex !== undefined) {
        return `variants.${variantNumber}.attributes.${attributeIndex}.${baseName}`;
    }

    if (variantNumber !== undefined) {
        return `variants.${variantNumber}.${baseName}`;
    }

    return baseName;
};

/**
 * Type guard for React change events
 */
export const isChangeEvent = (
    value: any
): value is React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> => {
    return value?.target !== undefined;
};

/**
 * Extract value from change event or direct value
 */
export const extractFieldValue = (value: any): any => {
    return isChangeEvent(value) ? value.target.value : value;
};

/**
 * Check if field should span full width
 */
export const isWideField = (fieldType: string): boolean => {
    return ["multiSelect", "multiCheckbox", "textarea"].includes(fieldType);
};

/**
 * Get grid span class based on field type
 * Grid: 1 column (mobile), 2 columns (large screens)
 */
export const getGridSpanClass = (fieldType: string): string => {
    return isWideField(fieldType)
        ? "col-span-1 lg:col-span-2"  // Wide fields span full width
        : "col-span-1";                 // Normal fields: 1 column
};

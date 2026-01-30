/**
 * ✨ Field Registry - نظام تسجيل الحقول
 * @description Registry pattern for field components
 */

import {
    TextField,
    CheckboxField,
    SwitchField,
    RadioField,
    SelectField,
    SearchableSelect,
    TextareaField,
    FileField,
} from "../Fields";
import { ForeignKeyField } from "../components/ForeignKeyField";
import { MultiSelectFieldWrapper } from "../components/MultiSelectFieldWrapper";
import { MultiCheckboxWrapper } from "../components/MultiCheckboxWrapper";

export type FieldType =
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "checkbox"
    | "switch"
    | "radio"
    | "select"
    | "foreignkey"
    | "multiSelect"
    | "multiCheckbox"
    | "file";

export type FieldComponent = React.ComponentType<any>;

/**
 * Field Registry Map
 */
export const FIELD_REGISTRY: Record<FieldType, FieldComponent> = {
    text: TextField,
    email: TextField,
    number: TextField,
    textarea: TextareaField,
    checkbox: CheckboxField,
    switch: SwitchField,
    radio: RadioField,
    select: SearchableSelect,
    foreignkey: ForeignKeyField,
    multiSelect: MultiSelectFieldWrapper,
    multiCheckbox: MultiCheckboxWrapper,
    file: FileField,
};

/**
 * Get field component by type
 */
export const getFieldComponent = (
    type: string
): FieldComponent | undefined => {
    return FIELD_REGISTRY[type as FieldType];
};

/**
 * Check if field type is registered
 */
export const isRegisteredFieldType = (type: string): type is FieldType => {
    return type in FIELD_REGISTRY;
};

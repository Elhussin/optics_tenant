export interface Permission {
    id: number;
    code: string;
    description: string;
}

export interface Role {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    permissions: Permission[];
}

export interface RoleFormData {
    name: string;
    description: string;
    is_active: boolean;
    permission_ids: number[];
}

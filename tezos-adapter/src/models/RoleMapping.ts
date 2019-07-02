export interface RoleMapping {
    roleId: string;
    address: string;
}

export interface XMLWithRoleMapping {
    xml: string;
    id: string;
    mappings: RoleMapping[];
}

export interface XMLWithRole {
    xml: string;
    task: string[];
    address: string;
    id: string;
    mappings: RoleMapping[];
}

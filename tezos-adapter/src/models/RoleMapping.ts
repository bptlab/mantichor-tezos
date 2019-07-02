export interface RoleMapping {
    role: string;
    identifier: string;
}

export interface ChoreographyMappings {
    id: string;
    mappings: RoleMapping[];
}

export interface XMLWithRoleMapping {
    xml: string;
    id: string;
    mappings: RoleMapping[];
}

export interface XMLWithRole {
    xml: string;
    task: string[];
    role: string;
    id: string;
}

export function getMappingsForChoreography(mappings: ChoreographyMappings[], id: string): RoleMapping[] {
    return mappings.find((map) => map.id === id).mappings;
}

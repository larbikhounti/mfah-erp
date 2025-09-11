export interface RoleResponse {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    _count?: {
        Users: number;
    };
}

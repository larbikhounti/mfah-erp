export interface GameType {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
export interface MachineType {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
export interface Game {
    id: number;
    name: string;
    price: number;
    playTime: number;
    gameTypeId?: number | null;
    isFavored?: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    gameType?: GameType | null;
    machineTypes?: MachineType[];
    _count?: {
        experiences?: number;
    };
    age?: number | null;
}
export interface GameWithRelations extends Game {
    gameType?: GameType | null;
    machineTypes?: MachineType[];
}
export interface GameResponse {
    id: number;
    name: string;
    price: number;
    playTime: number;
    gameTypeId?: number | null;
    isFavored?: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    gameType?: {
        id: number;
        name: string;
    } | null;
    machineTypes?: {
        id: number;
        name: string;
    }[];
    experiencesCount?: number;
    age?: number | null;
    domes?: {
        id: number;
        name: string;
    }[];
}
export interface PaginatedGamesResponse {
    games: GameResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

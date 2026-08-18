export declare class FilterGamesDto {
    name?: string;
    gameTypeId?: number;
    machineTypeIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    minPlayTime?: number;
    maxPlayTime?: number;
    isFavored?: boolean;
    page?: number;
    limit?: number;
    showArchived?: boolean;
}

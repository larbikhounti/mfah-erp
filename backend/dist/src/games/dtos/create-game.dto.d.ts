export declare class CreateGameDto {
    name: string;
    price: number;
    playTime: number;
    gameTypeId?: number;
    machineTypeIds?: number[];
    age?: number;
    isFavored?: boolean;
    domeId: number[];
}

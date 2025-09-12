import { PrismaService } from '../../prisma/prisma.service';
import { CreateGameTypeDto } from '../dtos/create-game-type.dto';
import { UpdateGameTypeDto } from '../dtos/update-game-type.dto';
import { BulkDeleteGameTypesDto } from '../dtos/bulk-delete-game-types.dto';
import { FilterGameTypesDto } from '../dtos/filter/filter-game-types.dto';
import { GameTypeResponse } from '../types/game-type-response.type';
export declare class GameTypesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filterParams: FilterGameTypesDto): Promise<{
        data: GameTypeResponse[];
        total: number;
    }>;
    createGameTypeByAdmin(data: CreateGameTypeDto): Promise<GameTypeResponse>;
    getGameTypeById(id: number): Promise<GameTypeResponse>;
    updateGameTypeByAdmin(id: number, data: UpdateGameTypeDto): Promise<GameTypeResponse>;
    deleteGameTypeByAdmin(id: number): Promise<{
        message: string;
    }>;
    bulkDeleteGameTypesByAdmin(data: BulkDeleteGameTypesDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
    }>;
}

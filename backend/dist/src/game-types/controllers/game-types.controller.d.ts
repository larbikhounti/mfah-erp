import { CreateGameTypeDto } from '../dtos/create-game-type.dto';
import { UpdateGameTypeDto } from '../dtos/update-game-type.dto';
import { BulkDeleteGameTypesDto } from '../dtos/bulk-delete-game-types.dto';
import { FilterGameTypesDto } from '../dtos/filter/filter-game-types.dto';
import { GameTypesService } from '../services/game-types.service';
export declare class GameTypesController {
    private gameTypesService;
    constructor(gameTypesService: GameTypesService);
    getAllGameTypes(filterParams: FilterGameTypesDto): Promise<{
        data: import("../types/game-type-response.type").GameTypeResponse[];
        total: number;
    }>;
    getGameTypeById(id: number): Promise<import("../types/game-type-response.type").GameTypeResponse>;
    getAllGameTypesAdmin(filterParams: FilterGameTypesDto): Promise<{
        data: import("../types/game-type-response.type").GameTypeResponse[];
        total: number;
    }>;
    createGameTypeByAdmin(createGameTypeDto: CreateGameTypeDto): Promise<import("../types/game-type-response.type").GameTypeResponse>;
    getGameTypeByIdAdmin(id: number): Promise<import("../types/game-type-response.type").GameTypeResponse>;
    updateGameTypeByAdmin(id: number, updateGameTypeDto: UpdateGameTypeDto): Promise<import("../types/game-type-response.type").GameTypeResponse>;
    deleteGameTypeByAdmin(id: number): Promise<{
        message: string;
    }>;
    bulkDeleteGameTypesByAdmin(bulkDeleteDto: BulkDeleteGameTypesDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
    }>;
}

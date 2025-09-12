import { GamesService } from '../services/games.service';
import { CreateGameDto, UpdateGameDto, FilterGamesDto, BulkDeleteGamesDto } from '../dtos';
import { GameResponse, PaginatedGamesResponse } from '../types';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    create(createGameDto: CreateGameDto): Promise<GameResponse>;
    findAll(filterDto: FilterGamesDto): Promise<PaginatedGamesResponse>;
    findOne(id: number): Promise<GameResponse>;
    update(id: number, updateGameDto: UpdateGameDto): Promise<GameResponse>;
    remove(id: number): Promise<{
        message: string;
    }>;
    bulkDelete(bulkDeleteDto: BulkDeleteGamesDto): Promise<{
        message: string;
        deletedCount: number;
    }>;
}

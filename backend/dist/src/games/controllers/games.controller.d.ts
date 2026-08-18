import { GamesService } from '../services/games.service';
import { CreateGameDto, UpdateGameDto, FilterGamesDto, BulkDeleteGamesDto, ToggleFavoriteGameDto } from '../dtos';
import { GameResponse, PaginatedGamesResponse } from '../types';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    create(createGameDto: CreateGameDto): Promise<GameResponse>;
    findAll(filterDto: FilterGamesDto): Promise<PaginatedGamesResponse>;
    findOne(id: number): Promise<GameResponse>;
    update(id: number, updateGameDto: UpdateGameDto): Promise<GameResponse>;
    toggleFavorite(id: number, toggleFavoriteDto: ToggleFavoriteGameDto): Promise<GameResponse>;
    bulkDelete(bulkDeleteDto: BulkDeleteGamesDto): Promise<{
        message: string;
        deletedCount: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    restore(id: number): Promise<{
        message: string;
    }>;
    bulkRestore(body: {
        gameIds: number[];
    }): Promise<{
        message: string;
        restoredCount: number;
        notFound: number[];
        notDeleted: number[];
    }>;
}

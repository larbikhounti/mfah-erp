import { PrismaService } from '../../prisma/prisma.service';
import { CreateGameDto, UpdateGameDto, FilterGamesDto, BulkDeleteGamesDto } from '../dtos';
import { GameResponse, PaginatedGamesResponse } from '../types';
export declare class GamesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createGameDto: CreateGameDto): Promise<GameResponse>;
    findAll(filterDto?: FilterGamesDto): Promise<PaginatedGamesResponse>;
    findOne(id: number): Promise<GameResponse>;
    update(id: number, updateGameDto: UpdateGameDto): Promise<GameResponse>;
    remove(id: number): Promise<{
        message: string;
    }>;
    bulkDelete(bulkDeleteDto: BulkDeleteGamesDto): Promise<{
        message: string;
        deletedCount: number;
    }>;
    private mapToGameResponse;
}

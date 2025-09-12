import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GamesService } from '../services/games.service';
import {
  CreateGameDto,
  UpdateGameDto,
  FilterGamesDto,
  BulkDeleteGamesDto,
} from '../dtos';
import { GameResponse, PaginatedGamesResponse } from '../types';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';
import { Public } from '../../auth/decorator/public.decorator';

@ApiTags('games')
@Controller({
  path: 'games',
  version: '1',
})
@UseGuards(AuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully',
    type: Object,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Game type or machine type not found',
  })
  async create(@Body() createGameDto: CreateGameDto): Promise<GameResponse> {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all games with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'Games retrieved successfully',
    type: Object,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by game name',
  })
  @ApiQuery({
    name: 'gameTypeId',
    required: false,
    description: 'Filter by game type ID',
  })
  @ApiQuery({
    name: 'machineTypeId',
    required: false,
    description: 'Filter by machine type ID',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Filter by minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Filter by maximum price',
  })
  @ApiQuery({
    name: 'minPlayTime',
    required: false,
    description: 'Filter by minimum play time',
  })
  @ApiQuery({
    name: 'maxPlayTime',
    required: false,
    description: 'Filter by maximum play time',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async findAll(
    @Query() filterDto: FilterGamesDto,
  ): Promise<PaginatedGamesResponse> {
    return this.gamesService.findAll(filterDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({
    status: 200,
    description: 'Game retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<GameResponse> {
    return this.gamesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a game' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({
    status: 200,
    description: 'Game updated successfully',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Game, game type, or machine type not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ): Promise<GameResponse> {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @UseGuards(AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a game (soft delete)' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({
    status: 200,
    description: 'Game deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Game has active experiences and cannot be deleted',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.gamesService.remove(id);
  }

  @Delete()
  @UseGuards(AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk delete games (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Games deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'One or more games not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'One or more games have active experiences and cannot be deleted',
  })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteGamesDto,
  ): Promise<{ message: string; deletedCount: number }> {
    return this.gamesService.bulkDelete(bulkDeleteDto);
  }
}

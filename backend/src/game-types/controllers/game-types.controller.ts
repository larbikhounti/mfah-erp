import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateGameTypeDto } from '../dtos/create-game-type.dto';
import { UpdateGameTypeDto } from '../dtos/update-game-type.dto';
import { BulkDeleteGameTypesDto } from '../dtos/bulk-delete-game-types.dto';
import { FilterGameTypesDto } from '../dtos/filter/filter-game-types.dto';
import { Public } from 'src/decorator/public.decorator';
import { GameTypesService } from '../services/game-types.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@ApiTags('game-types')
@Controller({
  path: 'game-types',
  version: '1',
})
export class GameTypesController {
  constructor(private gameTypesService: GameTypesService) {}

  // === PUBLIC ENDPOINTS ===

  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Get all game types with filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of game types retrieved successfully',
  })
  getAllGameTypes(@Query() filterParams: FilterGameTypesDto) {
    return this.gameTypesService.findAll(filterParams);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get game type by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Game type retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Game type not found' })
  getGameTypeById(@Param('id', ParseIntPipe) id: number) {
    return this.gameTypesService.getGameTypeById(id);
  }

  // === ADMIN ENDPOINTS ===

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/list/all')
  @ApiOperation({
    summary: 'Get all game types with admin privileges (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of game types retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAllGameTypesAdmin(@Query() filterParams: FilterGameTypesDto) {
    return this.gameTypesService.findAll(filterParams);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new game type (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Game type created successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({
    status: 409,
    description: 'Game type with name already exists',
  })
  createGameTypeByAdmin(@Body() createGameTypeDto: CreateGameTypeDto) {
    return this.gameTypesService.createGameTypeByAdmin(createGameTypeDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get game type by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Game type retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Game type not found' })
  getGameTypeByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.gameTypesService.getGameTypeById(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update game type by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Game type updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Game type not found' })
  @ApiResponse({
    status: 409,
    description: 'Name already taken by another game type',
  })
  updateGameTypeByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameTypeDto: UpdateGameTypeDto,
  ) {
    return this.gameTypesService.updateGameTypeByAdmin(id, updateGameTypeDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete game type by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Game type deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Game type not found' })
  deleteGameTypeByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.gameTypesService.deleteGameTypeByAdmin(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete game types by IDs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Game types deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedCount: { type: 'number' },
        notFound: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  bulkDeleteGameTypesByAdmin(@Body() bulkDeleteDto: BulkDeleteGameTypesDto) {
    return this.gameTypesService.bulkDeleteGameTypesByAdmin(bulkDeleteDto);
  }
}

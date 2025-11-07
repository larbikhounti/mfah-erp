import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StatisticsService } from '../services/statistics.service';
import {
  StatisticsResponse,
  MachineStatisticsResponse,
  GameStatisticsResponse,
} from '../types/statistics-response.type';

@ApiTags('statistics')
@Controller({
  path: 'statistics',
  version: '1',
})
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('games/:domId')
  @ApiOperation({
    summary: 'Get game statistics for a specific DOM or all DOMs',
    description:
      'Returns game statistics including play count and total revenue per game. Use "all" for aggregated statistics across all DOMs. Optionally filter by date range.',
  })
  @ApiParam({
    name: 'domId',
    description: 'DOM ID (number) or "all" for all DOMs',
    example: '1',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Game statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid DOM ID or date format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'DOM not found',
  })
  async getGameStatisticsByDom(
    @Param('domId') domId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<GameStatisticsResponse> {
    const gameStats = await this.statisticsService.getGameStatisticsByDom(
      domId,
      startDate,
      endDate,
    );

    return {
      success: true,
      data: gameStats,
    };
  }

  @Get('machines/:domId')
  @ApiOperation({
    summary: 'Get machine statistics for a specific DOM or all DOMs',
    description:
      'Returns machine statistics including experiences count and total revenue per machine. Use "all" for aggregated statistics across all DOMs. Optionally filter by date range.',
  })
  @ApiParam({
    name: 'domId',
    description: 'DOM ID (number) or "all" for all DOMs',
    example: '1',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Machine statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid DOM ID or date format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'DOM not found',
  })
  async getMachineStatisticsByDom(
    @Param('domId') domId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<MachineStatisticsResponse> {
    const machineStats = await this.statisticsService.getMachineStatisticsByDom(
      domId,
      startDate,
      endDate,
    );

    return {
      success: true,
      data: machineStats,
    };
  }

  @Get('dom/:domId')
  @ApiOperation({
    summary: 'Get statistics for a specific DOM or all DOMs',
    description:
      'Returns statistics including experiences, tickets, and revenue data. Use "all" for aggregated statistics across all DOMs. Optionally filter by date range.',
  })
  @ApiParam({
    name: 'domId',
    description: 'DOM ID (number) or "all" for all DOMs',
    example: '1',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid DOM ID or date format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'DOM not found',
  })
  async getStatisticsByDom(
    @Param('domId') domId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<StatisticsResponse> {
    const statistics = await this.statisticsService.getStatisticsByDom(
      domId,
      startDate,
      endDate,
    );

    return {
      success: true,
      data: statistics,
    };
  }
}
